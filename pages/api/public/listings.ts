import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';
import { Listing, PaginatedResponse } from '../../../types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    // Get query parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const location = req.query.location as string;
    const minPrice = req.query.minPrice ? parseInt(req.query.minPrice as string) : undefined;
    const maxPrice = req.query.maxPrice ? parseInt(req.query.maxPrice as string) : undefined;
    const fuelType = req.query.fuelType as string;
    const transmission = req.query.transmission as string;

    // Build filter - only show approved listings
    const filter: any = { status: 'approved' };
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { carModel: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = minPrice;
      if (maxPrice !== undefined) filter.price.$lte = maxPrice;
    }

    if (fuelType) {
      filter.fuelType = fuelType;
    }

    if (transmission) {
      filter.transmission = transmission;
    }

    // Get total count
    const total = await db.collection('listings').countDocuments(filter);

    // Get paginated data
    const skip = (page - 1) * limit;
    const listings = await db
      .collection('listings')
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
    console.error('Fetch public listings error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
} 