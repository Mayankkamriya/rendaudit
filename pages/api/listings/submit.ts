import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';
import { Listing } from '../../../types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const {
      title,
      description,
      price,
      location,
      carModel,
      carYear,
      mileage,
      fuelType,
      transmission,
      features,
      images,
      userId,
      userName,
      userEmail
    } = req.body;

    // Validate required fields
    const requiredFields = ['title', 'description', 'price', 'location', 'carModel', 'carYear', 'mileage', 'fuelType', 'transmission', 'userId', 'userName', 'userEmail'];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ success: false, error: `${field} is required` });
      }
    }

    // Validate data types
    if (typeof price !== 'number' || price <= 0) {
      return res.status(400).json({ success: false, error: 'Price must be a positive number' });
    }

    if (typeof carYear !== 'number' || carYear < 1900 || carYear > new Date().getFullYear() + 1) {
      return res.status(400).json({ success: false, error: 'Invalid car year' });
    }

    if (typeof mileage !== 'number' || mileage < 0) {
      return res.status(400).json({ success: false, error: 'Mileage must be a positive number' });
    }

    // Validate fuel type
    const validFuelTypes = ['gasoline', 'diesel', 'electric', 'hybrid'];
    if (!validFuelTypes.includes(fuelType)) {
      return res.status(400).json({ success: false, error: 'Invalid fuel type' });
    }

    // Validate transmission
    const validTransmissions = ['automatic', 'manual'];
    if (!validTransmissions.includes(transmission)) {
      return res.status(400).json({ success: false, error: 'Invalid transmission type' });
    }

    const client = await clientPromise;
    const db = client.db();

    const newListing: Omit<Listing, '_id'> = {
      title,
      description,
      price,
      location,
      carModel,
      carYear,
      mileage,
      fuelType,
      transmission,
      features: Array.isArray(features) ? features : [],
      images: Array.isArray(images) ? images : [],
      status: 'pending',
      userId,
      userName,
      userEmail,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('listings').insertOne(newListing);

    res.status(201).json({
      success: true,
      message: 'Listing submitted successfully and is pending approval',
      data: {
        id: result.insertedId.toString(),
        status: 'pending'
      }
    });

  } catch (error) {
    console.error('Submit listing error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
} 