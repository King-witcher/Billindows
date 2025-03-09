// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = JSON.parse(atob(process.env.NEXT_PUBLIC_FIREBASE_CONFIG))

// Initialize Firebase
export const firebase = initializeApp(firebaseConfig)
export const firebaseAuth = getAuth(firebase)
