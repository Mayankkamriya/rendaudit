import { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import clientPromise from '../../../lib/mongodb';
import { verifyToken } from '../../../lib/auth';
import { Listing, AuditLog } from '../../../types';

interface ListingDocument extends Omit<Listing, '_id'> {
  _id: ObjectId;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ success: false, error: 'Invalid listing ID' });
  }

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

    try {
      switch (req.method) {
        case 'GET':
          const listing = await db.collection<ListingDocument>('listings').findOne({ _id: new ObjectId(id) });
          
          if (!listing) {
            return res.status(404).json({ success: false, error: 'Listing not found' });
          }

          // Convert ObjectId to string for response
          const listingResponse = {
            ...listing,
            _id: listing._id.toString(),
          };

          res.status(200).json({
            success: true,
            data: listingResponse,
          });
          break;

      case 'PUT':
        const { action, ...updateData } = req.body;

        if (action === 'approve' || action === 'reject') {
          // Status change
          const listing = await db.collection<ListingDocument>('listings').findOne({ _id: new ObjectId(id) });
          
          if (!listing) {
            return res.status(404).json({ success: false, error: 'Listing not found' });
          }

          const newStatus = action === 'approve' ? 'approved' : 'rejected';
          
          await db.collection<ListingDocument>('listings').updateOne(
            { _id: new ObjectId(id) },
            { 
              $set: { 
                status: newStatus,
                updatedAt: new Date()
              } 
            }
          );

          // Create audit log
          const auditLog = {
            action,
            listingId: id,
            listingTitle: listing.title,
            adminId: user.id,
            adminName: user.name,
            adminEmail: user.email,
            previousStatus: listing.status,
            newStatus,
            timestamp: new Date(),
          };

          await db.collection('auditLogs').insertOne(auditLog);

          res.status(200).json({
            success: true,
            message: `Listing ${action}d successfully`,
          });
        } else {
          // Update listing data
          const listing = await db.collection<ListingDocument>('listings').findOne({ _id: new ObjectId(id) });
          
          if (!listing) {
            return res.status(404).json({ success: false, error: 'Listing not found' });
          }

          const changes: Record<string, any> = {};
          Object.keys(updateData).forEach(key => {
            if (listing[key as keyof ListingDocument] !== updateData[key]) {
              changes[key] = {
                from: listing[key as keyof ListingDocument],
                to: updateData[key],
              };
            }
          });

          await db.collection<ListingDocument>('listings').updateOne(
            { _id: new ObjectId(id) },
            { 
              $set: { 
                ...updateData,
                updatedAt: new Date()
              } 
            }
          );

          // Create audit log for edit
          if (Object.keys(changes).length > 0) {
            const auditLog = {
              action: 'edit',
              listingId: id,
              listingTitle: listing.title,
              adminId: user.id,
              adminName: user.name,
              adminEmail: user.email,
              changes,
              timestamp: new Date(),
            };

            await db.collection('auditLogs').insertOne(auditLog);
          }

          res.status(200).json({
            success: true,
            message: 'Listing updated successfully',
          });
        }
        break;

      default:
        res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Listing operation error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
} 