export interface WhatsAppMessage {
  id: string;
  from: string;
  to: string;
  body: string;
  timestamp: Date;
  type: 'text' | 'image' | 'audio' | 'video' | 'document';
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'complaint' | 'lead' | 'support' | 'general' | 'sales';
  status: 'pending' | 'processing' | 'replied' | 'resolved';
  classification?: AIClassification;
  metadata?: Record<string, any>;
}

export interface AIClassification {
  priority: {
    level: 'low' | 'medium' | 'high' | 'critical';
    confidence: number;
    reasoning: string;
  };
  category: {
    type: 'complaint' | 'lead' | 'support' | 'general' | 'sales';
    confidence: number;
    reasoning: string;
  };
  sentiment: {
    score: number; // -1 to 1
    label: 'negative' | 'neutral' | 'positive';
  };
  urgency: boolean;
  keywords: string[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'agent' | 'manager';
  createdAt: Date;
  lastActive: Date;
}

export interface DashboardMetrics {
  totalMessages: number;
  pendingMessages: number;
  averageResponseTime: number;
  categoriesCount: Record<string, number>;
  prioritiesCount: Record<string, number>;
  dailyVolume: { date: string; count: number }[];
}

export interface WebhookPayload {
  object: string;
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: string;
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        messages?: WhatsAppWebhookMessage[];
        statuses?: WhatsAppStatus[];
      };
      field: string;
    }>;
  }>;
}

export interface WhatsAppWebhookMessage {
  id: string;
  from: string;
  timestamp: string;
  type: 'text' | 'image' | 'audio' | 'video' | 'document';
  text?: {
    body: string;
  };
  image?: {
    mime_type: string;
    sha256: string;
    id: string;
  };
}

export interface WhatsAppStatus {
  id: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  recipient_id: string;
}

export interface MessageReply {
  messageId: string;
  to: string;
  body: string;
  type: 'text';
}