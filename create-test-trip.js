import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyClK3sJRs7tBKNVXK7HzwWcYKGM5sXcCg4",
  authDomain: "privatehire-car.firebaseapp.com",
  projectId: "privatehire-car",
  storageBucket: "privatehire-car.firebasestorage.app",
  messagingSenderId: "105064574163",
  appId: "1:105064574163:web:0ae58f46dd24929d82f6c2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function createTestTrip() {
  try {
    console.log('📍 Creating test trip...');

    const tripDoc = await addDoc(collection(db, 'trips'), {
      customerId: 'user1',
      customerName: 'John Customer',
      customerPhone: '+447987654321',
      pickup: {
        name: 'Baker Street Station',
        latitude: 51.5226,
        longitude: -0.1586
      },
      destination: {
        name: 'Tower Bridge',
        latitude: 51.5055,
        longitude: -0.0754
      },
      vehicleType: 'Standard SUV',
      distance: 5.2,
      duration: 18,
      fare: 24.50,
      status: 'pending',
      paymentMethod: 'card',
      createdAt: Timestamp.now(),
      bookingType: 'local'
    });

    console.log('✅ Test trip created:', tripDoc.id);
    console.log('📍 Pickup: Baker Street Station (51.5226, -0.1586)');
    console.log('📍 Destination: Tower Bridge (51.5055, -0.0754)');
    console.log('💰 Fare: £24.50');
    console.log('📊 Status: pending');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createTestTrip();
