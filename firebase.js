import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, remove } from "firebase/database";

// --- Firebase Configuration ---
// User-provided configuration for the Firebase project.
const firebaseConfig = {
  apiKey: "AIzaSyDfMCNG_-H7KGGJUNPjYMnWJm8yKY2MVFI",
  authDomain: "my-sister-f81fe.firebaseapp.com",
  databaseURL: "https://my-sister-f81fe-default-rtdb.firebaseio.com",
  projectId: "my-sister-f81fe",
  storageBucket: "my-sister-f81fe.firebasestorage.app",
  messagingSenderId: "578960836689",
  appId: "1:578960836689:web:b58ebbf9af8c4387ced070",
  measurementId: "G-Q9Y4HMLQE3"
};

let db;
let isFirebaseInitialized = false;

/**
 * Initializes the Firebase application and database connection.
 * @returns {boolean} - True if initialization is successful, false otherwise.
 */
export function initializeFirebase() {
    try {
        const app = initializeApp(firebaseConfig);
        db = getDatabase(app);
        isFirebaseInitialized = true;
        console.log("Firebase initialized successfully");
        return true;
    } catch (error) {
        console.error("Firebase initialization failed:", error);
        alert("Could not connect to the online database. History will be loaded from local backup if available, but changes won't be saved online.");
        isFirebaseInitialized = false;
        return false;
    }
}

/**
 * Saves a single history entry to Firebase Realtime Database.
 * @param {object} entry - The history entry to save.
 */
export async function saveHistoryEntryToFirebase(entry) {
    if (!isFirebaseInitialized) return;
    const historyRef = ref(db, 'history/' + entry.date);
    await set(historyRef, entry);
}

/**
 * Loads the entire history from Firebase Realtime Database.
 * @returns {Promise<Array>} - A promise that resolves to an array of history items.
 */
export async function loadHistoryFromFirebase() {
    if (!isFirebaseInitialized) return [];
    const historyRef = ref(db, 'history');
    const snapshot = await get(historyRef);
    if (snapshot.exists()) {
        const data = snapshot.val();
        return Object.values(data);
    } else {
        return [];
    }
}

/**
 * Deletes a specific history entry from Firebase Realtime Database.
 * @param {string} dateKey - The date key of the entry to delete.
 */
export async function deleteHistoryEntryFromFirebase(dateKey) {
    if (!isFirebaseInitialized) return;
    const historyRef = ref(db, 'history/' + dateKey);
    await remove(historyRef);
}