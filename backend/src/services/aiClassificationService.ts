import OpenAI from 'openai';
import { db, aiClassifications } from '../db';
import { logger } from '../utils/logger';
import { AIClassification } from '../../../shared/types';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is required');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class AIClassificationService {
  private readonly model = 'gpt-4o';

  /**
   * Classify a WhatsApp message using OpenAI GPT-4
   */
  async classifyMessage(messageBody: string): Promise<AIClassification> {
    const startTime = Date.now();

    try {
      const prompt = this.buildClassificationPrompt(messageBody);

      const completion = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: `You are an expert customer service AI that analyzes WhatsApp messages for a business.
            You classify messages by priority, category, sentiment, and urgency.
            Always respond with valid JSON only, no additional text.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.1, // Low temperature for consistent results
        max_tokens: 1000,
        response_format: { type: 'json_object' },
      });

      const responseContent = completion.choices[0]?.message?.content;
      if (!responseContent) {
        throw new Error('No response content from OpenAI');
      }

      const classification = JSON.parse(responseContent) as AIClassification;

      // Validate the classification structure
      this.validateClassification(classification);

      const processingTime = Date.now() - startTime;

      // Save classification to database
      await this.saveClassification(messageBody, classification, processingTime);

      logger.info('Message classified successfully', {
        priority: classification.priority.level,
        category: classification.category.type,
        sentiment: classification.sentiment.label,
        urgency: classification.urgency,
        processingTimeMs: processingTime,
      });

      return classification;

    } catch (error) {
      const processingTime = Date.now() - startTime;
      logger.error('AI classification failed:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        messageBody: messageBody.substring(0, 100) + '...',
        processingTimeMs: processingTime,
      });

      // Return a default classification on failure
      return this.getDefaultClassification();
    }
  }

  /**
   * Build the classification prompt
   */
  private buildClassificationPrompt(messageBody: string): string {
    return `
Analyze this WhatsApp message and classify it according to the following criteria:

MESSAGE: "${messageBody}"

Classify this message and respond with JSON in exactly this format:

{
  "priority": {
    "level": "low|medium|high|critical",
    "confidence": 0.0-1.0,
    "reasoning": "brief explanation"
  },
  "category": {
    "type": "complaint|lead|support|general|sales",
    "confidence": 0.0-1.0,
    "reasoning": "brief explanation"
  },
  "sentiment": {
    "score": -1.0 to 1.0,
    "label": "negative|neutral|positive"
  },
  "urgency": true/false,
  "keywords": ["key", "words", "extracted"]
}

CLASSIFICATION GUIDELINES:

PRIORITY:
- critical: Emergencies, service outages, angry customers, urgent business matters
- high: Complaints, time-sensitive requests, important business inquiries
- medium: General support, product questions, standard business communication
- low: General information, greetings, acknowledgments

CATEGORY:
- complaint: Customer complaints, issues, problems, dissatisfaction
- lead: Sales inquiries, new customer interest, business opportunities
- support: Technical help, how-to questions, product assistance
- general: Greetings, thanks, general conversation, information requests
- sales: Pricing, purchase requests, upselling opportunities

SENTIMENT:
- Score from -1 (very negative) to 1 (very positive)
- Label: negative (<-0.2), neutral (-0.2 to 0.2), positive (>0.2)

URGENCY:
- true: Requires immediate attention (within 1 hour)
- false: Can wait for normal business response

KEYWORDS:
- Extract 3-8 relevant business keywords from the message
- Focus on product names, issues, emotions, actions needed

Respond with only the JSON object, no additional text.
`;
  }

  /**
   * Validate the classification response
   */
  private validateClassification(classification: AIClassification): void {
    const validPriorities = ['low', 'medium', 'high', 'critical'];
    const validCategories = ['complaint', 'lead', 'support', 'general', 'sales'];
    const validSentiments = ['negative', 'neutral', 'positive'];

    if (!validPriorities.includes(classification.priority.level)) {
      throw new Error(`Invalid priority level: ${classification.priority.level}`);
    }

    if (!validCategories.includes(classification.category.type)) {
      throw new Error(`Invalid category type: ${classification.category.type}`);
    }

    if (!validSentiments.includes(classification.sentiment.label)) {
      throw new Error(`Invalid sentiment label: ${classification.sentiment.label}`);
    }

    if (classification.priority.confidence < 0 || classification.priority.confidence > 1) {
      throw new Error(`Invalid priority confidence: ${classification.priority.confidence}`);
    }

    if (classification.category.confidence < 0 || classification.category.confidence > 1) {
      throw new Error(`Invalid category confidence: ${classification.category.confidence}`);
    }

    if (classification.sentiment.score < -1 || classification.sentiment.score > 1) {
      throw new Error(`Invalid sentiment score: ${classification.sentiment.score}`);
    }
  }

  /**
   * Save classification results to database
   */
  private async saveClassification(
    messageBody: string,
    classification: AIClassification,
    processingTimeMs: number,
    messageId?: string
  ): Promise<void> {
    try {
      if (!messageId) {
        // If no messageId provided, this is just for logging/analytics
        return;
      }

      await db.insert(aiClassifications).values({
        messageId,
        priorityLevel: classification.priority.level,
        priorityConfidence: classification.priority.confidence.toString(),
        priorityReasoning: classification.priority.reasoning,
        categoryType: classification.category.type,
        categoryConfidence: classification.category.confidence.toString(),
        categoryReasoning: classification.category.reasoning,
        sentimentScore: classification.sentiment.score.toString(),
        sentimentLabel: classification.sentiment.label,
        urgency: classification.urgency,
        keywords: classification.keywords,
        rawResponse: classification,
        modelUsed: this.model,
        processingTimeMs: processingTimeMs.toString(),
      });

    } catch (error) {
      logger.error('Failed to save classification to database:', error);
    }
  }

  /**
   * Get default classification for fallback
   */
  private getDefaultClassification(): AIClassification {
    return {
      priority: {
        level: 'medium',
        confidence: 0.5,
        reasoning: 'Default classification due to AI processing failure',
      },
      category: {
        type: 'general',
        confidence: 0.5,
        reasoning: 'Default classification due to AI processing failure',
      },
      sentiment: {
        score: 0,
        label: 'neutral',
      },
      urgency: false,
      keywords: ['unclassified'],
    };
  }

  /**
   * Batch classify multiple messages
   */
  async classifyBatch(messages: Array<{ id: string; body: string }>): Promise<Array<{ id: string; classification: AIClassification }>> {
    const results = [];

    for (const message of messages) {
      const classification = await this.classifyMessage(message.body);
      results.push({ id: message.id, classification });

      // Add a small delay to avoid rate limiting
      await this.delay(100);
    }

    return results;
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const aiClassificationService = new AIClassificationService();

// Export the main function for convenience
export const classifyMessage = aiClassificationService.classifyMessage.bind(aiClassificationService);