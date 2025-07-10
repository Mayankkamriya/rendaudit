import { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import clientPromise from '../../../lib/mongodb';
import { verifyToken } from '../../../lib/auth';
import { Listing, PaginatedResponse } from '../../../types';

interface ListingDocument extends Omit<Listing, '_id'> {
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
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const search = req.query.search as string;

    // Build filter
    const filter: any = {};
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { carModel: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    // Get total count
    const total = await db.collection<ListingDocument>('listings').countDocuments(filter);

    // Get paginated data
    const skip = (page - 1) * limit;
    const listings = await db
      .collection<ListingDocument>('listings')
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Convert ObjectIds to strings for response
    const listingsResponse = listings.map(listing => ({
      ...listing,
      _id: listing._id.toString(),
    })) as Listing[];

    const totalPages = Math.ceil(total / limit);

    const response: PaginatedResponse<Listing> = {
      data: listingsResponse,
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
    console.error('Fetch listings error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
} 