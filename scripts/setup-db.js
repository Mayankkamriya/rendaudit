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
        title: '2020 Maruti Suzuki Ciaz - Excellent Condition',
        description: 'Well-maintained Ciaz with low mileage. Perfect for daily commute or business trips.',
        price: 1800,
        location: 'Delhi, NCR',
        carModel: 'Maruti Suzuki Ciaz',
        carYear: 2020,
        mileage: 25000,
        fuelType: 'petrol',
        transmission: 'automatic',
        features: ['Bluetooth', 'Reverse Camera', 'Cruise Control', 'Heated Seats'],
        images: ['https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400'],
        status: 'pending',
        userId: 'user1',
        userName: 'Anil Kapoor',
        userEmail: 'anil.kapoor@email.in',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
      },
      {
        title: '2019 Honda City ZX - Sport Edition',
        description: 'Sporty Honda City with great mileage and modern features.',
        price: 1650,
        location: 'Mumbai, Maharashtra',
        carModel: 'Honda City ZX',
        carYear: 2019,
        mileage: 32000,
        fuelType: 'petrol',
        transmission: 'automatic',
        features: ['Android Auto', 'Apple CarPlay', 'Lane Assist', 'Blind Spot Monitor'],
        images: ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400'],
        status: 'approved',
        userId: 'user2',
        userName: 'Priya Sharma',
        userEmail: 'priya.sharma@email.in',
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-12'),
      },
      {
        title: '2021 Tata Nexon EV - Electric Luxury',
        description: 'Premium electric SUV with connected features and long range.',
        price: 2800,
        location: 'Bangalore, Karnataka',
        carModel: 'Tata Nexon EV',
        carYear: 2021,
        mileage: 15000,
        fuelType: 'electric',
        transmission: 'automatic',
        features: ['Fast Charging', 'Sunroof', 'Connected Features', 'Premium Audio'],
        images: ['https://images.unsplash.com/photo-1536700503339-1e4b06520771?w=400'],
        status: 'rejected',
        userId: 'user3',
        userName: 'Rahul Verma',
        userEmail: 'rahul.verma@email.in',
        createdAt: new Date('2024-01-08'),
        updatedAt: new Date('2024-01-09'),
      },
      {
        title: '2018 Mahindra Thar - Diesel 4x4',
        description: 'Rugged off-roader with powerful engine and iconic design.',
        price: 2400,
        location: 'Jaipur, Rajasthan',
        carModel: 'Mahindra Thar',
        carYear: 2018,
        mileage: 45000,
        fuelType: 'diesel',
        transmission: 'manual',
        features: ['4x4 Drive', 'Leather Seats', 'Touchscreen', 'Adventure Kit'],
        images: ['https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?w=400'],
        status: 'pending',
        userId: 'user4',
        userName: 'Sneha Mehra',
        userEmail: 'sneha.mehra@email.in',
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-20'),
      },
      {
        title: '2022 Skoda Slavia - Luxury Sedan',
        description: 'German-engineered premium sedan with comfort and tech.',
        price: 2600,
        location: 'Pune, Maharashtra',
        carModel: 'Skoda Slavia',
        carYear: 2022,
        mileage: 12000,
        fuelType: 'petrol',
        transmission: 'automatic',
        features: ['Skoda Connect', 'Heads-up Display', 'Parking Sensors', 'Sunroof'],
        images: ['https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400'],
        status: 'approved',
        userId: 'user5',
        userName: 'Vikram Joshi',
        userEmail: 'vikram.joshi@email.in',
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