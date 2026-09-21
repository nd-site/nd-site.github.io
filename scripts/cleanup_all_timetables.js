// scripts/cleanup_all_timetables.js
// This script enumerates and deletes ALL documents in the 'timetables' collection
// and all of their sub‑collections (presence, comments, etc.).
// It also verifies that protected collections remain unchanged.

const admin = require('firebase-admin');
admin.initializeApp({ credential: admin.credential.applicationDefault() });
const db = admin.firestore();

async function countCollection(colRef) {
  const snap = await colRef.get();
  return snap.size;
}

async function countTimetableDescendants() {
  const timetablesCol = db.collection('timetables');
  const timetablesSnap = await timetablesCol.get();
  let totalDocs = timetablesSnap.size;
  let totalDesc = 0;
  let presenceCount = 0;
  let commentsCount = 0;
  for (const doc of timetablesSnap.docs) {
    const subCols = await doc.ref.listCollections();
    for (const sub of subCols) {
      const subSnap = await sub.get();
      const subSize = subSnap.size;
      totalDesc += subSize;
      if (sub.id === 'presence') presenceCount += subSize;
      if (sub.id === 'comments') commentsCount += subSize;
    }
  }
  return { totalDocs, totalDesc, presenceCount, commentsCount };
}

async function getProtectedCounts() {
  const quizzes = await countCollection(db.collection('quizzes'));
  const users = await countCollection(db.collection('users'));
  const ndids = await countCollection(db.collection('ndids'));
  const emails = await countCollection(db.collection('emails'));
  const googleIds = await countCollection(db.collection('google_identities'));
  const countersSnap = await db.doc('counters/code_ids').get();
  const codeIdNext = countersSnap.exists ? countersSnap.get('nextNumericValue') : null;
  return { quizzes, users, ndids, emails, googleIds, codeIdNext };
}

async function deleteAllTimetables() {
  const col = db.collection('timetables');
  const snap = await col.get();
  for (const doc of snap.docs) {
    // delete sub‑collections recursively
    const subCols = await doc.ref.listCollections();
    for (const sub of subCols) {
      const subSnap = await sub.get();
      const batch = db.batch();
      subSnap.docs.forEach(d => batch.delete(d.ref));
      await batch.commit();
    }
    // delete the timetable document itself
    await doc.ref.delete();
  }
}

(async () => {
  console.log('--- BEGIN TIMETABLE FULL CLEANUP ---');

  // 1️⃣ Capture BEFORE counts
  const before = await countTimetableDescendants();
  const protectedBefore = await getProtectedCounts();
  console.log('Before cleanup:');
  console.log('Timetable docs:', before.totalDocs);
  console.log('Total descendant docs:', before.totalDesc);
  console.log('Presence docs:', before.presenceCount);
  console.log('Comments docs:', before.commentsCount);
  console.log('Protected data (quizzes, users, counters/code_ids):', protectedBefore);

  // 2️⃣ Delete all timetables
  await deleteAllTimetables();
  console.log('Deletion executed.');

  // 3️⃣ Capture AFTER counts
  const after = await countTimetableDescendants();
  const protectedAfter = await getProtectedCounts();
  console.log('After cleanup:');
  console.log('Timetable docs:', after.totalDocs);
  console.log('Total descendant docs:', after.totalDesc);
  console.log('Presence docs:', after.presenceCount);
  console.log('Comments docs:', after.commentsCount);
  console.log('Protected data after:', protectedAfter);

  // 4️⃣ Verify protected data unchanged
  const unchanged =
    protectedBefore.quizzes === protectedAfter.quizzes &&
    protectedBefore.users === protectedAfter.users &&
    protectedBefore.ndids === protectedAfter.ndids &&
    protectedBefore.emails === protectedAfter.emails &&
    protectedBefore.googleIds === protectedAfter.googleIds &&
    protectedBefore.codeIdNext === protectedAfter.codeIdNext;
  console.log('Protected data unchanged:', unchanged);

  // 5️⃣ Final verification of timetables emptiness
  const finalEmpty = after.totalDocs === 0 && after.totalDesc === 0;
  console.log('Timetables fully empty:', finalEmpty);

  console.log('--- END CLEANUP REPORT ---');
  process.exit(finalEmpty && unchanged ? 0 : 1);
})();
