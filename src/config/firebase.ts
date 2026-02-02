import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/**
 * IMPORTANT: Cấu hình Firebase này PHẢI GIỐNG NHAU cho cả 3 apps:
 * 1. Customer App (private-hire-car)
 * 2. Driver App (private-hire-driver)
 * 3. Admin Web (private-hire-admin)
 * 
 * Setup Steps:
 * 1. Tạo Firebase project tại: https://console.firebase.google.com
 * 2. Enable Authentication (Email/Password)
 * 3. Enable Firestore Database
 * 4. Lấy config từ: Project Settings → General → Your apps
 * 5. Paste config vào đây (thay thế phần TODO bên dưới)
 * 6. Copy CÙNG config này vào cả 3 apps
 */

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
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
