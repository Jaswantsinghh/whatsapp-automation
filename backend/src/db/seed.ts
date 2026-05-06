import { db, users, messageTypes, userMessageTypePermissions } from './index';
import { authService } from '../services/authService';
import { messageTypesService } from '../services/messageTypesService';
import { logger } from '../utils/logger';

/**
 * Seed initial data for the login system
 */
export async function seedLoginData() {
  try {
    logger.info('Starting login system data seeding...');

    // Create admin user
    const adminUser = await authService.register({
      email: 'admin@example.com',
      password: 'admin123',
      name: 'Admin User',
      role: 'admin',
    });

    logger.info('Admin user created:', { userId: adminUser.user.id });

    // Create manager user
    const managerUser = await authService.register({
      email: 'manager@example.com',
      password: 'manager123',
      name: 'Manager User',
      role: 'manager',
    });

    logger.info('Manager user created:', { userId: managerUser.user.id });

    // Create agent user
    const agentUser = await authService.register({
      email: 'agent@example.com',
      password: 'agent123',
      name: 'Agent User',
      role: 'agent',
    });

    logger.info('Agent user created:', { userId: agentUser.user.id });

    // Create message types
    const messageTypeData = [
      {
        name: 'Support Requests',
        description: 'General customer support inquiries',
        color: '#3B82F6',
      },
      {
        name: 'Complaints',
        description: 'Customer complaints and issues',
        color: '#EF4444',
      },
      {
        name: 'Sales Inquiries',
        description: 'Product and sales related questions',
        color: '#10B981',
      },
      {
        name: 'Technical Issues',
        description: 'Technical problems and bug reports',
        color: '#F59E0B',
      },
      {
        name: 'Billing Questions',
        description: 'Payment and billing related queries',
        color: '#8B5CF6',
      },
    ];

    const createdMessageTypes = [];
    for (const typeData of messageTypeData) {
      const messageType = await messageTypesService.createMessageType(typeData);
      createdMessageTypes.push(messageType);
      logger.info('Message type created:', { messageTypeId: messageType.id, name: messageType.name });
    }

    // Assign permissions to agent user
    const agentPermissions = [
      // Support Requests - can view and reply
      {
        messageTypeId: createdMessageTypes[0].id,
        canView: true,
        canReply: true,
        canAssign: false,
      },
      // Complaints - can only view
      {
        messageTypeId: createdMessageTypes[1].id,
        canView: true,
        canReply: false,
        canAssign: false,
      },
      // Technical Issues - can view and reply
      {
        messageTypeId: createdMessageTypes[3].id,
        canView: true,
        canReply: true,
        canAssign: false,
      },
    ];

    await authService.updateUserPermissions(agentUser.user.id, agentPermissions);
    logger.info('Agent permissions assigned');

    // Assign permissions to manager user
    const managerPermissions = createdMessageTypes.map(type => ({
      messageTypeId: type.id,
      canView: true,
      canReply: true,
      canAssign: true,
    }));

    await authService.updateUserPermissions(managerUser.user.id, managerPermissions);
    logger.info('Manager permissions assigned');

    logger.info('Login system data seeding completed successfully!');

    return {
      users: {
        admin: adminUser.user,
        manager: managerUser.user,
        agent: agentUser.user,
      },
      messageTypes: createdMessageTypes,
    };

  } catch (error) {
    logger.error('Error seeding login data:', error);
    throw error;
  }
}

/**
 * Run the seed function if this file is executed directly
 */
if (require.main === module) {
  seedLoginData()
    .then(() => {
      console.log('✅ Seeding completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}