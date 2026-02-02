import { initializeApp } from 'firebase/app';
import { getFirestore, collection, setDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDrWwfUzmWPCvej-jOdDliZ0adEzxxotHI",
  authDomain: "privatehire-car.firebaseapp.com",
  projectId: "privatehire-car",
  storageBucket: "privatehire-car.firebasestorage.app",
  messagingSenderId: "402703883604",
  appId: "1:402703883604:web:835111aad4abc2a10cbcc1",
  measurementId: "G-KQG6JZTTC4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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
    console.log('✅ Driver created: driver@test.com');

    // Create test user/customer
    await setDoc(doc(db, 'users', 'user1'), {
      name: 'John Customer',
      email: 'customer@test.com',
      phone: '+447987654321'
    });
    console.log('✅ User created: customer@test.com');

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
    console.log('✅ Second driver created: sarah@test.com');

    console.log('');
    console.log('🎉 Seed data complete!');
    console.log('');
    console.log('📋 Collections created:');
    console.log('   ✅ drivers (2 documents)');
    console.log('   ✅ users (1 document)');
    console.log('');
    console.log('💡 Next steps:');
    console.log('   1. Refresh Firebase Console to see data');
    console.log('   2. Driver app → Login → Set Online');
    console.log('   3. Customer app → Book a trip');
    console.log('   4. Driver app → Accept trip');
    console.log('');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

seedData();
