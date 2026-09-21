// scripts/cleanup_timetable.js
// Cleanup script for timetables/LA0407092627 and all its subcollections.
// Uses Firebase Admin SDK with Application Default Credentials (from logged‑in Firebase CLI).

const admin = require('firebase-admin');
admin.initializeApp({ credential: admin.credential.applicationDefault() });
const db = admin.firestore();
const TIMETABLE_ID = 'LA0407092627';
const docRef = db.doc(`timetables/${TIMETABLE_ID}`);

async function deleteCollection(colRef) {
  const snapshot = await colRef.get();
  const batch = db.batch();
  snapshot.docs.forEach(d => batch.delete(d.ref));
  await batch.commit();
  // Recursively delete sub‑collections of each deleted doc
  for (const doc of snapshot.docs) {
    const subCols = await doc.ref.listCollections();
    for (const sub of subCols) {
      await deleteCollection(sub);
    }
  }
}

async function main() {
  console.log('Starting cleanup for timetable:', TIMETABLE_ID);
  // Delete all sub‑collections of the timetable document
  const subCols = await docRef.listCollections();
  for (const sub of subCols) {
    console.log('Deleting sub‑collection', sub.path);
    await deleteCollection(sub);
  }
  // Delete the timetable document itself
  console.log('Deleting timetable document');
  await docRef.delete();
  console.log('Cleanup completed');
}

main().catch(err => {
  console.error('Error during cleanup:', err);
  process.exit(1);
});
