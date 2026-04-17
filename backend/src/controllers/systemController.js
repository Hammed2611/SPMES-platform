import prisma from '../config/prisma.js';

// Global SSE clients Map (userId -> Response object)
export const sseClients = new Map();

/**
 * Push an event to a specific connected user via SSE
 */
export const sendSSEToUser = (userId, type, data) => {
  const client = sseClients.get(userId);
  if (client) {
    client.write(`data: ${JSON.stringify({ type, data })}\n\n`);
  }
};

/**
 * SSE Endpoint setup
 */
export const streamNotifications = (req, res) => {
  const userId = req.user.id;

  // Set standard SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  // Send initial connection success event
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', data: 'SSE Active' })}\n\n`);

  // Register client
  sseClients.set(userId, res);

  // Remove client on connection close
  req.on('close', () => {
    sseClients.delete(userId);
  });
};

/**
 * Get all notifications for the current user
 */
export const getNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error fetching notifications' });
  }
};

/**
 * Mark notification as read
 */
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.notification.update({
      where: { id, userId: req.user.id },
      data: { isRead: true }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error marking notification' });
  }
};

/**
 * Get system audit log (Admin only)
 */
export const getAuditLogs = async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      include: { user: { select: { name: true, role: true } } },
      orderBy: { timestamp: 'desc' },
      take: 50
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error fetching audit logs' });
  }
};
