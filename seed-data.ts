import { collection, addDoc, setDoc, doc } from 'firebase/firestore';
import { db } from './src/config/firebase';

async function seedData() {
  try {
    console.log('🌱 Seeding Firebase data...');

    // Create test driver
    await setDoc(doc(db, 'drivers', 'driver1'), {
      name: 'Mike Driver',
      email: 'driver@test.com',
      phone: '+447123456789',
      status: 'offline',
      location: {
        latitude: 51.5074,
        longitude: -0.1278
      },
      vehicle: {
        type: 'sedan',
        plate: 'ABC123',
        model: 'Toyota Camry',
        color: 'Black'
      },
      rating: 4.8,
      totalTrips: 247
    });
    console.log('✅ Driver created');

    // Create test user/customer
    await setDoc(doc(db, 'users', 'user1'), {
      name: 'John Customer',
      email: 'customer@test.com',
      phone: '+447987654321'
    });
    console.log('✅ User created');

    // Create another driver
    await setDoc(doc(db, 'drivers', 'driver2'), {
      name: 'Sarah Johnson',
      email: 'sarah@test.com',
      phone: '+447111222333',
      status: 'offline',
      location: {
        latitude: 51.5155,
        longitude: -0.1415
      },
      vehicle: {
        type: 'suv',
        plate: 'XYZ789',
        model: 'Honda CR-V',
        color: 'White'
      },
      rating: 4.9,
      totalTrips: 156
    });
    console.log('✅ Second driver created');

    console.log('');
    console.log('🎉 Seed data complete!');
    console.log('');
    console.log('📋 Test accounts:');
    console.log('   Driver: driver@test.com');
    console.log('   Customer: customer@test.com');
    console.log('');
    console.log('💡 Next steps:');
    console.log('   1. Driver app → Login → Set Online');
    console.log('   2. Customer app → Book a trip');
    console.log('   3. Driver app → Accept trip');
    console.log('');
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  }
}

seedData();
