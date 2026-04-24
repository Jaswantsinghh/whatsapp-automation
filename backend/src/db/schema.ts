import { pgTable, uuid, varchar, text, timestamp, boolean, jsonb, decimal, index, foreignKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: varchar('role', { length: 20 }).notNull().default('agent'), // admin, manager, agent
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  lastActiveAt: timestamp('last_active_at').defaultNow(),
}, (table) => ({
  emailIdx: index('users_email_idx').on(table.email),
  roleIdx: index('users_role_idx').on(table.role),
}));

// WhatsApp messages table
export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  whatsappId: varchar('whatsapp_id', { length: 255 }).unique().notNull(),
  from: varchar('from', { length: 255 }).notNull(), // WhatsApp phone number
  to: varchar('to', { length: 255 }).notNull(), // Business phone number
  body: text('body').notNull(),
  messageType: varchar('message_type', { length: 20 }).notNull().default('text'), // text, image, audio, video, document
  priority: varchar('priority', { length: 20 }).notNull().default('medium'), // low, medium, high, critical
  category: varchar('category', { length: 20 }).notNull().default('general'), // complaint, lead, support, general, sales
  status: varchar('status', { length: 20 }).notNull().default('pending'), // pending, processing, replied, resolved
  assignedToId: uuid('assigned_to_id'),
  metadata: jsonb('metadata'), // Additional WhatsApp metadata
  receivedAt: timestamp('received_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  fromIdx: index('messages_from_idx').on(table.from),
  priorityIdx: index('messages_priority_idx').on(table.priority),
  categoryIdx: index('messages_category_idx').on(table.category),
  statusIdx: index('messages_status_idx').on(table.status),
  receivedAtIdx: index('messages_received_at_idx').on(table.receivedAt),
  assignedToIdx: index('messages_assigned_to_idx').on(table.assignedToId),
  whatsappIdIdx: index('messages_whatsapp_id_idx').on(table.whatsappId),
  assignedToFk: foreignKey({
    columns: [table.assignedToId],
    foreignColumns: [users.id],
  }),
}));

// AI Classifications table
export const aiClassifications = pgTable('ai_classifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  messageId: uuid('message_id').notNull(),
  priorityLevel: varchar('priority_level', { length: 20 }).notNull(),
  priorityConfidence: decimal('priority_confidence', { precision: 5, scale: 4 }).notNull(),
  priorityReasoning: text('priority_reasoning').notNull(),
  categoryType: varchar('category_type', { length: 20 }).notNull(),
  categoryConfidence: decimal('category_confidence', { precision: 5, scale: 4 }).notNull(),
  categoryReasoning: text('category_reasoning').notNull(),
  sentimentScore: decimal('sentiment_score', { precision: 5, scale: 4 }).notNull(), // -1 to 1
  sentimentLabel: varchar('sentiment_label', { length: 10 }).notNull(), // negative, neutral, positive
  urgency: boolean('urgency').default(false),
  keywords: jsonb('keywords'), // Array of extracted keywords
  rawResponse: jsonb('raw_response'), // Full OpenAI response for debugging
  modelUsed: varchar('model_used', { length: 50 }).notNull().default('gpt-4'),
  processingTimeMs: decimal('processing_time_ms', { precision: 8, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  messageIdIdx: index('ai_classifications_message_id_idx').on(table.messageId),
  priorityLevelIdx: index('ai_classifications_priority_level_idx').on(table.priorityLevel),
  categoryTypeIdx: index('ai_classifications_category_type_idx').on(table.categoryType),
  urgencyIdx: index('ai_classifications_urgency_idx').on(table.urgency),
  messageIdFk: foreignKey({
    columns: [table.messageId],
    foreignColumns: [messages.id],
  }),
}));

// Message replies table
export const messageReplies = pgTable('message_replies', {
  id: uuid('id').primaryKey().defaultRandom(),
  messageId: uuid('message_id').notNull(),
  sentBy: uuid('sent_by').notNull(), // User ID who sent the reply
  body: text('body').notNull(),
  whatsappMessageId: varchar('whatsapp_message_id', { length: 255 }), // WhatsApp's message ID for the reply
  status: varchar('status', { length: 20 }).notNull().default('sent'), // sent, delivered, read, failed
  sentAt: timestamp('sent_at').defaultNow().notNull(),
  deliveredAt: timestamp('delivered_at'),
  readAt: timestamp('read_at'),
}, (table) => ({
  messageIdIdx: index('message_replies_message_id_idx').on(table.messageId),
  sentByIdx: index('message_replies_sent_by_idx').on(table.sentBy),
  statusIdx: index('message_replies_status_idx').on(table.status),
  messageIdFk: foreignKey({
    columns: [table.messageId],
    foreignColumns: [messages.id],
  }),
  sentByFk: foreignKey({
    columns: [table.sentBy],
    foreignColumns: [users.id],
  }),
}));

// Analytics/metrics aggregation table
export const dailyMetrics = pgTable('daily_metrics', {
  id: uuid('id').primaryKey().defaultRandom(),
  date: varchar('date', { length: 10 }).notNull(), // YYYY-MM-DD format
  totalMessages: decimal('total_messages', { precision: 10, scale: 0 }).notNull().default('0'),
  priorityBreakdown: jsonb('priority_breakdown'), // {low: 10, medium: 20, high: 5, critical: 1}
  categoryBreakdown: jsonb('category_breakdown'), // {complaint: 5, lead: 15, support: 10, general: 6}
  averageResponseTimeMs: decimal('average_response_time_ms', { precision: 10, scale: 2 }),
  totalReplies: decimal('total_replies', { precision: 10, scale: 0 }).notNull().default('0'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  dateIdx: index('daily_metrics_date_idx').on(table.date),
}));

// User sessions table for JWT management
export const userSessions = pgTable('user_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  token: varchar('token', { length: 500 }).notNull(),
  refreshToken: varchar('refresh_token', { length: 500 }),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  isRevoked: boolean('is_revoked').default(false),
}, (table) => ({
  userIdIdx: index('user_sessions_user_id_idx').on(table.userId),
  tokenIdx: index('user_sessions_token_idx').on(table.token),
  userIdFk: foreignKey({
    columns: [table.userId],
    foreignColumns: [users.id],
  }),
}));

// Define relationships
export const usersRelations = relations(users, ({ many }) => ({
  assignedMessages: many(messages),
  messageReplies: many(messageReplies),
  userSessions: many(userSessions),
}));

export const messagesRelations = relations(messages, ({ one, many }) => ({
  assignedTo: one(users, {
    fields: [messages.assignedToId],
    references: [users.id],
  }),
  aiClassification: one(aiClassifications),
  replies: many(messageReplies),
}));

export const aiClassificationsRelations = relations(aiClassifications, ({ one }) => ({
  message: one(messages, {
    fields: [aiClassifications.messageId],
    references: [messages.id],
  }),
}));

export const messageRepliesRelations = relations(messageReplies, ({ one }) => ({
  message: one(messages, {
    fields: [messageReplies.messageId],
    references: [messages.id],
  }),
  sentBy: one(users, {
    fields: [messageReplies.sentBy],
    references: [users.id],
  }),
}));

export const userSessionsRelations = relations(userSessions, ({ one }) => ({
  user: one(users, {
    fields: [userSessions.userId],
    references: [users.id],
  }),
}));