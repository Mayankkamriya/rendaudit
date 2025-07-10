import { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    const user = verifyToken(token);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
} 