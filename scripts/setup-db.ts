require('dotenv').config();
const {dotenv} = require('dotenv');
dotenv.config();
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rentaudit';

async function setupDatabase() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db();

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const admin = {
      email: 'admin@rentaudit.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection('admins').updateOne(
      { email: admin.email },
      { $set: admin },
      { upsert: true }
    );

    // Sample listings
    const sampleListings = [
      {
        title: '2020 Toyota Camry - Excellent Condition',
        description: 'Well-maintained Toyota Camry with low mileage. Perfect for daily commute or business trips.',
        price: 45,
        location: 'New York, NY',
        carModel: 'Toyota Camry',
        carYear: 2020,
        mileage: 25000,
        fuelType: 'gasoline',
        transmission: 'automatic',
        features: ['Bluetooth', 'Backup Camera', 'Cruise Control', 'Heated Seats'],
        images: ['https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400'],
        status: 'pending',
        userId: 'user1',
        userName: 'John Doe',
        userEmail: 'john@example.com',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
      },
      {
        title: '2019 Honda Civic - Sport Edition',
        description: 'Sporty Honda Civic with great fuel efficiency and modern features.',
        price: 38,
        location: 'Los Angeles, CA',
        carModel: 'Honda Civic',
        carYear: 2019,
        mileage: 32000,
        fuelType: 'gasoline',
        transmission: 'automatic',
        features: ['Apple CarPlay', 'Android Auto', 'Lane Assist', 'Blind Spot Monitor'],
        images: ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400'],
        status: 'approved',
        userId: 'user2',
        userName: 'Jane Smith',
        userEmail: 'jane@example.com',
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-12'),
      },
      {
        title: '2021 Tesla Model 3 - Electric Luxury',
        description: 'Premium electric vehicle with autopilot and long range capability.',
        price: 85,
        location: 'San Francisco, CA',
        carModel: 'Tesla Model 3',
        carYear: 2021,
        mileage: 15000,
        fuelType: 'electric',
        transmission: 'automatic',
        features: ['Autopilot', 'Supercharging', 'Glass Roof', 'Premium Audio'],
        images: ['https://images.unsplash.com/photo-1536700503339-1e4b06520771?w=400'],
        status: 'rejected',
        userId: 'user3',
        userName: 'Mike Johnson',
        userEmail: 'mike@example.com',
        createdAt: new Date('2024-01-08'),
        updatedAt: new Date('2024-01-09'),
      },
      {
        title: '2018 Ford Mustang - V8 Power',
        description: 'Classic American muscle car with powerful V8 engine and iconic design.',
        price: 65,
        location: 'Chicago, IL',
        carModel: 'Ford Mustang',
        carYear: 2018,
        mileage: 45000,
        fuelType: 'gasoline',
        transmission: 'manual',
        features: ['V8 Engine', 'Leather Seats', 'Premium Sound', 'Performance Package'],
        images: ['https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?w=400'],
        status: 'pending',
        userId: 'user4',
        userName: 'Sarah Wilson',
        userEmail: 'sarah@example.com',
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-20'),
      },
      {
        title: '2022 BMW 3 Series - Luxury Sedan',
        description: 'Premium German engineering with cutting-edge technology and comfort.',
        price: 95,
        location: 'Miami, FL',
        carModel: 'BMW 3 Series',
        carYear: 2022,
        mileage: 12000,
        fuelType: 'gasoline',
        transmission: 'automatic',
        features: ['iDrive System', 'Heads-up Display', 'Parking Assistant', 'Premium Package'],
        images: ['https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400'],
        status: 'approved',
        userId: 'user5',
        userName: 'David Brown',
        userEmail: 'david@example.com',
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-01-07'),
      },
    ];

    for (const listing of sampleListings) {
      await db.collection('listings').updateOne(
        { title: listing.title },
        { $set: listing },
        { upsert: true }
      );
    }

    console.log('✅ Database setup completed!');
    console.log('🔐 Admin credentials: admin@rentaudit.com / admin123');
  } catch (error) {
    console.error('❌ Error setting up database:', error);
  } finally {
    await client.close();
  }
}

setupDatabase();
