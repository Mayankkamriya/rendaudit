const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rentaudit';

async function seedDatabase() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db();

    console.log('🌱 Starting database seeding...');

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

    // Real car rental listings with diverse data
    const realListings = [
      {
        title: '2022 Tata Nexon EV Max - Long Range',
        description: 'Electric compact SUV with 437 km range, fast charging, and premium interiors. Ideal for city rides and weekend getaways.',
        price: 3000,
        location: 'Bangalore, Karnataka',
        carModel: 'Tata Nexon EV Max',
        carYear: 2022,
        mileage: 9500,
        fuelType: 'electric',
        transmission: 'automatic',
        features: ['Fast Charging', 'Sunroof', 'Connected Car Tech', 'Cruise Control', 'Wireless Charging', 'Leather Seats'],
        images: ['https://images.unsplash.com/photo-1536700503339-1e4b06520771?w=400'],
        status: 'approved',
        userId: 'user001',
        userName: 'Rohit Sharma',
        userEmail: 'rohit.sharma@email.in',
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-12'),
      },
      {
        title: '2021 Mahindra XUV700 AX7 - Luxury SUV',
        description: 'Feature-packed SUV with ADAS, dual HD screens, and powerful turbo engine. Great for family and long-distance drives.',
        price: 2700,
        location: 'Mumbai, Maharashtra',
        carModel: 'Mahindra XUV700',
        carYear: 2021,
        mileage: 18000,
        fuelType: 'diesel',
        transmission: 'automatic',
        features: ['ADAS', 'Panoramic Roof', 'Sony Sound System', 'Cruise Control', 'Ventilated Seats', 'Connected Car'],
        images: ['https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400'],
        status: 'pending',
        userId: 'user002',
        userName: 'Sneha Iyer',
        userEmail: 'sneha.iyer@email.in',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
      },
      {
        title: '2023 Hyundai Verna Turbo SX(O)',
        description: 'Sleek sedan with futuristic design, powerful turbo engine, and 6 airbags. Ideal for urban commutes and business travel.',
        price: 2000,
        location: 'Delhi, NCR',
        carModel: 'Hyundai Verna',
        carYear: 2023,
        mileage: 6200,
        fuelType: 'petrol',
        transmission: 'automatic',
        features: ['ADAS', 'Ventilated Seats', 'Smart Cruise Control', '10.25" Touchscreen', 'Sunroof', 'BOSE Audio'],
        images: ['https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?w=400'],
        status: 'approved',
        userId: 'user003',
        userName: 'Arjun Mehta',
        userEmail: 'arjun.mehta@email.in',
        createdAt: new Date('2024-01-08'),
        updatedAt: new Date('2024-01-10'),
      },
      {
        title: '2020 Honda City ZX CVT - i-VTEC',
        description: 'Reliable sedan with paddle shifters, rear parking camera, and spacious cabin. Great for both city and highway.',
        price: 1700,
        location: 'Chennai, Tamil Nadu',
        carModel: 'Honda City',
        carYear: 2020,
        mileage: 29000,
        fuelType: 'petrol',
        transmission: 'automatic',
        features: ['Paddle Shifters', 'Touchscreen', 'Cruise Control', 'Rear Camera', 'Auto Headlamps', 'Alloy Wheels'],
        images: ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400'],
        status: 'rejected',
        userId: 'user004',
        userName: 'Divya Krishnan',
        userEmail: 'divya.krishnan@email.in',
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-01-07'),
      },
      {
        title: '2021 MG Hector Sharp - Connected SUV',
        description: 'Mid-size SUV with large infotainment, i-SMART tech, and panoramic sunroof. Great for long drives.',
        price: 2200,
        location: 'Hyderabad, Telangana',
        carModel: 'MG Hector',
        carYear: 2021,
        mileage: 14200,
        fuelType: 'petrol',
        transmission: 'automatic',
        features: ['i-SMART', 'Panoramic Sunroof', '360° Camera', 'Voice Control', 'Internet Inside', 'Powered Tailgate'],
        images: ['https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400'],
        status: 'pending',
        userId: 'user005',
        userName: 'Karan Desai',
        userEmail: 'karan.desai@email.in',
        createdAt: new Date('2024-01-18'),
        updatedAt: new Date('2024-01-18'),
      },
      {
        title: '2022 Skoda Slavia 1.5 TSI - Style',
        description: 'Turbocharged sedan with DSG gearbox, ventilated seats, and solid European build quality.',
        price: 1900,
        location: 'Pune, Maharashtra',
        carModel: 'Skoda Slavia',
        carYear: 2022,
        mileage: 8000,
        fuelType: 'petrol',
        transmission: 'automatic',
        features: ['1.5L TSI Engine', 'DSG Gearbox', 'Ventilated Seats', 'Touch Infotainment', 'Hill Hold', 'Cruise Control'],
        images: ['https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?w=400'],
        status: 'approved',
        userId: 'user006',
        userName: 'Neha Kulkarni',
        userEmail: 'neha.kulkarni@email.in',
        createdAt: new Date('2024-01-12'),
        updatedAt: new Date('2024-01-14'),
      },
      {
        title: '2023 Mahindra Thar LX Hard Top - 4x4',
        description: 'Iconic off-roader with rugged looks, 4x4 capabilities, and convertible top. Best for adventure seekers.',
        price: 2500,
        location: 'Manali, Himachal Pradesh',
        carModel: 'Mahindra Thar',
        carYear: 2023,
        mileage: 5000,
        fuelType: 'diesel',
        transmission: 'manual',
        features: ['4x4 Drive', 'Convertible Roof', 'Touchscreen', 'Cruise Control', 'Hill Descent', 'Removable Roof'],
        images: ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400'],
        status: 'pending',
        userId: 'user007',
        userName: 'Simran Kaur',
        userEmail: 'simran.kaur@email.in',
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-20'),
      },
      {
        title: '2021 Maruti Suzuki Ciaz Alpha - Hybrid',
        description: 'Spacious sedan with SHVS hybrid tech, great mileage, and modern features. Best for family use.',
        price: 1600,
        location: 'Ahmedabad, Gujarat',
        carModel: 'Maruti Suzuki Ciaz',
        carYear: 2021,
        mileage: 23000,
        fuelType: 'hybrid',
        transmission: 'automatic',
        features: ['SHVS Hybrid', 'SmartPlay Studio', 'Rear Camera', 'Auto Climate', 'Cruise Control', 'Projector Lamps'],
        images: ['https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400'],
        status: 'approved',
        userId: 'user008',
        userName: 'Ankit Patel',
        userEmail: 'ankit.patel@email.in',
        createdAt: new Date('2024-01-03'),
        updatedAt: new Date('2024-01-05'),
      },
      {
        title: '2022 Kia Carens Prestige Plus - 7 Seater',
        description: 'Spacious MPV with premium features, great safety, and multiple seating modes.',
        price: 2100,
        location: 'Kochi, Kerala',
        carModel: 'Kia Carens',
        carYear: 2022,
        mileage: 12000,
        fuelType: 'diesel',
        transmission: 'manual',
        features: ['6 Airbags', 'Roof Rails', 'LED DRLs', '10.25" Touchscreen', 'Rear AC', 'Electric ORVMs'],
        images: ['https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400'],
        status: 'rejected',
        userId: 'user009',
        userName: 'Ayesha Rahman',
        userEmail: 'ayesha.rahman@email.in',
        createdAt: new Date('2024-01-06'),
        updatedAt: new Date('2024-01-08'),
      },
      {
        title: '2023 Toyota Innova HyCross - Hybrid MPV',
        description: 'New-age hybrid MPV with monocoque chassis, great mileage, and lounge-like comfort.',
        price: 2800,
        location: 'Jaipur, Rajasthan',
        carModel: 'Toyota Innova HyCross',
        carYear: 2023,
        mileage: 4000,
        fuelType: 'hybrid',
        transmission: 'automatic',
        features: ['TNGA Platform', 'Hybrid Engine', 'Captain Seats', 'Sunroof', 'Touchscreen', 'ADAS'],
        images: ['https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400'],
        status: 'pending',
        userId: 'user010',
        userName: 'Rahul Yadav',
        userEmail: 'rahul.yadav@email.in',
        createdAt: new Date('2024-01-22'),
        updatedAt: new Date('2024-01-22'),
      }
    ];

    // Clear existing listings and insert new ones
    await db.collection('listings').deleteMany({});
    await db.collection('listings').insertMany(realListings);

    // Create sample audit logs
    const auditLogs = [
      {
        action: 'approve',
        listingId: realListings[0]._id?.toString() || '1',
        listingTitle: realListings[0].title,
        adminId: admin._id?.toString() || 'admin1',
        adminName: admin.name,
        adminEmail: admin.email,
        previousStatus: 'pending',
        newStatus: 'approved',
        timestamp: new Date('2024-01-12'),
      },
      {
        action: 'reject',
        listingId: realListings[3]._id?.toString() || '4',
        listingTitle: realListings[3].title,
        adminId: admin._id?.toString() || 'admin1',
        adminName: admin.name,
        adminEmail: admin.email,
        previousStatus: 'pending',
        newStatus: 'rejected',
        timestamp: new Date('2024-01-07'),
      },
      {
        action: 'edit',
        listingId: realListings[2]._id?.toString() || '3',
        listingTitle: realListings[2].title,
        adminId: admin._id?.toString() || 'admin1',
        adminName: admin.name,
        adminEmail: admin.email,
        changes: {
          price: { from: 80, to: 85 },
          description: { from: 'Original description', to: realListings[2].description }
        },
        timestamp: new Date('2024-01-10'),
      }
    ];

    // Clear existing audit logs and insert new ones
    await db.collection('auditLogs').deleteMany({});
    await db.collection('auditLogs').insertMany(auditLogs);

    console.log('✅ Database seeded successfully!');
    console.log(`📊 Created ${realListings.length} listings`);
    console.log(`📝 Created ${auditLogs.length} audit logs`);
    console.log('🔐 Admin credentials: admin@rentaudit.com / admin123');
    console.log('\n📋 Sample listings status:');
    console.log('- 4 approved listings');
    console.log('- 3 pending listings');
    console.log('- 2 rejected listings');
    console.log('- 1 hybrid vehicle');
    console.log('- 1 electric vehicle');
    console.log('- Various price ranges ($65-$180/day)');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await client.close();
  }
}

seedDatabase(); 