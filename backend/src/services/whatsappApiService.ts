import axios from 'axios';
import { logger } from '../utils/logger';
import { MessageReply } from '../../../shared/types';

interface WhatsAppAPIResponse {
  messaging_product: string;
  contacts: Array<{
    input: string;
    wa_id: string;
  }>;
  messages: Array<{
    id: string;
    message_status?: string;
  }>;
}

interface SendMessagePayload {
  messaging_product: 'whatsapp';
  recipient_type: 'individual';
  to: string;
  type: 'text';
  text: {
    preview_url: boolean;
    body: string;
  };
}

export class WhatsAppAPIService {
  private readonly baseUrl = 'https://graph.facebook.com/v18.0';
  private readonly phoneNumberId: string;
  private readonly accessToken: string;

  constructor() {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.WHATSAPP_TOKEN;

    if (!phoneNumberId || !accessToken) {
      throw new Error('WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_TOKEN environment variables are required');
    }

    this.phoneNumberId = phoneNumberId;
    this.accessToken = accessToken;
  }

  /**
   * Send a text message via WhatsApp Business API
   */
  async sendMessage(reply: MessageReply): Promise<string | null> {
    try {
      const payload: SendMessagePayload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: reply.to,
        type: 'text',
        text: {
          preview_url: true, // Allow URL previews
          body: reply.body,
        },
      };

      const response = await axios.post<WhatsAppAPIResponse>(
        `${this.baseUrl}/${this.phoneNumberId}/messages`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000, // 10 seconds timeout
        }
      );

      const messageId = response.data.messages?.[0]?.id;

      if (!messageId) {
        logger.error('No message ID returned from WhatsApp API', {
          response: response.data,
          payload,
        });
        return null;
      }

      logger.info('Message sent successfully via WhatsApp API', {
        messageId,
        to: reply.to,
        bodyPreview: reply.body.substring(0, 50) + (reply.body.length > 50 ? '...' : ''),
      });

      return messageId;

    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error('WhatsApp API error:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
        });

        // Handle specific WhatsApp API errors
        if (error.response?.status === 401) {
          throw new Error('Invalid WhatsApp access token');
        } else if (error.response?.status === 400) {
          const errorData = error.response.data;
          throw new Error(`WhatsApp API error: ${errorData.error?.message || 'Bad request'}`);
        } else if (error.response?.status === 429) {
          throw new Error('Rate limit exceeded for WhatsApp API');
        }
      }

      logger.error('Failed to send WhatsApp message:', error);
      throw error;
    }
  }

  /**
   * Send a template message (for pre-approved templates)
   */
  async sendTemplateMessage(
    to: string,
    templateName: string,
    language: string = 'en_US',
    parameters?: Array<{ type: 'text'; text: string }>
  ): Promise<string | null> {
    try {
      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: language,
          },
          ...(parameters && parameters.length > 0 && {
            components: [
              {
                type: 'body',
                parameters,
              },
            ],
          }),
        },
      };

      const response = await axios.post<WhatsAppAPIResponse>(
        `${this.baseUrl}/${this.phoneNumberId}/messages`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      const messageId = response.data.messages?.[0]?.id;

      logger.info('Template message sent successfully', {
        messageId,
        to,
        templateName,
        language,
      });

      return messageId;

    } catch (error) {
      logger.error('Failed to send template message:', error);
      throw error;
    }
  }

  /**
   * Mark a message as read
   */
  async markMessageAsRead(messageId: string): Promise<boolean> {
    try {
      const payload = {
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId,
      };

      await axios.post(
        `${this.baseUrl}/${this.phoneNumberId}/messages`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          timeout: 5000,
        }
      );

      logger.info('Message marked as read', { messageId });
      return true;

    } catch (error) {
      logger.error('Failed to mark message as read:', error);
      return false;
    }
  }

  /**
   * Get business profile information
   */
  async getBusinessProfile(): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/${this.phoneNumberId}`,
        {
          params: {
            fields: 'id,verified_name,display_phone_number,quality_rating',
          },
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
          timeout: 5000,
        }
      );

      return response.data;

    } catch (error) {
      logger.error('Failed to get business profile:', error);
      throw error;
    }
  }

  /**
   * Validate phone number format
   */
  validatePhoneNumber(phoneNumber: string): boolean {
    // WhatsApp phone numbers should be in international format without + or 00
    const phoneRegex = /^\d{10,15}$/;
    return phoneRegex.test(phoneNumber);
  }

  /**
   * Format phone number for WhatsApp API
   */
  formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');

    // If it starts with 0, assume it's a local number and needs country code
    if (cleaned.startsWith('0')) {
      // This is a simplified example - in production, you'd need proper country code handling
      return '1' + cleaned.substring(1); // Assuming US (+1) for example
    }

    return cleaned;
  }
}

// Export singleton instance
export const whatsappApiService = new WhatsAppAPIService();