import { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import clientPromise from '../../../lib/mongodb';
import { verifyToken } from '../../../lib/auth';
import { AuditLog, PaginatedResponse } from '../../../types';

interface AuditLogDocument extends Omit<AuditLog, '_id'> {
  _id: ObjectId;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Verify authentication
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    const user = verifyToken(token);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }

    const client = await clientPromise;
    const db = client.db();

    // Get query parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const action = req.query.action as string;
    const adminId = req.query.adminId as string;

    // Build filter
    const filter: any = {};
    if (action && action !== 'all') {
      filter.action = action;
    }
    if (adminId && adminId !== 'all') {
      filter.adminId = adminId;
    }

    // Get total count
    const total = await db.collection<AuditLogDocument>('auditLogs').countDocuments(filter);

    // Get paginated data
    const skip = (page - 1) * limit;
    const auditLogs = await db
      .collection<AuditLogDocument>('auditLogs')
      .find(filter)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Convert ObjectIds to strings for response
    const auditLogsResponse = auditLogs.map(log => ({
      ...log,
      _id: log._id.toString(),
    })) as AuditLog[];

    const totalPages = Math.ceil(total / limit);

    const response: PaginatedResponse<AuditLog> = {
      data: auditLogsResponse,
      total,
      page,
      limit,
      totalPages,
    };

    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Fetch audit logs error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
} 