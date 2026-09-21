// scripts/cleanup_invalid_google_accounts.js
/**
 * Script to clean up invalid Google accounts in Firebase Auth.
 * It scans all Firebase Auth users, checks if the UID exists as a codeId in the 'users' collection.
 * If not, and the user has a providerData entry for Google (providerId === 'google.com'),
 * it deletes the Auth user and removes any dangling google_identities document.
 */

import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const auth = admin.auth();

async function main() {
  console.log('Starting cleanup of invalid Google accounts...');
  const listResult = await auth.listUsers();
  const users = listResult.users;
  let deletedCount = 0;
  for (const user of users) {
    const uid = user.uid;
    const hasGoogle = user.providerData.some(p => p.providerId === 'google.com');
    if (!hasGoogle) continue;
    const doc = await db.collection('users').doc(uid).get();
    if (doc.exists) continue;
    try {
      await auth.deleteUser(uid);
      console.log(`Deleted Auth user UID=${uid}`);
    } catch (e) {
      console.error(`Failed to delete Auth user UID=${uid}:`, e);
    }
    const mappingSnap = await db.collection('google_identities').where('googleSubjectId', '==', uid).get();
    for (const mdoc of mappingSnap.docs) {
      await mdoc.ref.delete();
      console.log(`Deleted stale google_identities doc ${mdoc.id}`);
    }
    deletedCount++;
  }
  console.log(`Cleanup complete. Total Google accounts deleted: ${deletedCount}`);
}

main().catch(err => {
  console.error('Error during cleanup:', err);
  process.exit(1);
});
