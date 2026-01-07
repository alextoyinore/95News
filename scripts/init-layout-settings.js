// Run this script once to initialize the layout settings in Firestore
// Usage: node scripts/init-layout-settings.js

const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'YOUR_PROJECT_ID',
    // For this one-time script, you can use your project ID directly
};

admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: serviceAccount.projectId
});

const db = admin.firestore();

const defaultSettings = {
    activeTemplateId: 'magazine',
    widgets: [
        { id: 'w1', name: 'Social Sidebar', active: true },
        { id: 'w2', name: 'Newsletter Signup', active: true },
        { id: 'w3', name: 'Most Read Posts', active: true },
        { id: 'w4', name: 'Trending Tags', active: false },
        { id: 'w5', name: 'Author Spotlight', active: false },
    ],
    lastUpdated: admin.firestore.FieldValue.serverTimestamp()
};

async function initSettings() {
    try {
        await db.collection('settings').doc('home_layout').set(defaultSettings);
        console.log('✓ Layout settings initialized successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error initializing settings:', error);
        process.exit(1);
    }
}

initSettings();
