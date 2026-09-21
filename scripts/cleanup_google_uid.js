// scripts/cleanup_google_uid.js
/**
 * Cleanup script for a specific malformed Google UID in Firebase Auth.
 * Usage:
 *   node cleanup_google_uid.js <uid_prefix> [--execute]
 *   --execute   actually delete the user and any orphan google_identities docs.
 * Without --execute it performs a DRY‑RUN and only reports findings.
 */

import admin from 'firebase-admin';
import process from 'process';

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const auth = admin.auth();

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error('Usage: node cleanup_google_uid.js <uid_prefix> [--execute]');
    process.exit(1);
  }
  const uidPrefix = args[0];
  const execute = args.includes('--execute');

  // ---- STEP 1: Find the user in Firebase Auth ----
  const listResult = await auth.listUsers();
  const targetUser = listResult.users.find(u => u.uid.startsWith(uidPrefix) && u.providerData.some(p => p.providerId === 'google.com'));
  if (!targetUser) {
    console.log(`No Google Auth user found with UID starting with "${uidPrefix}".`);
    return;
  }
  const uid = targetUser.uid;
  console.log('--- FOUND TARGET USER ---');
  console.log(`UID: ${uid}`);
  console.log(`Email: ${targetUser.email || '(none)'}\n`);

  // ---- STEP 2: Verify there is NO canonical users/{CodeID} doc ----
  const userDoc = await db.collection('users').doc(uid).get();
  if (userDoc.exists) {
    console.log('ERROR: A users/{CodeID} document exists for this UID. This should NOT be a malformed account.');
    process.exit(1);
  } else {
    console.log('Verification: No users/{CodeID} document exists for this UID (as expected).');
  }

  // ---- STEP 3: Check for orphan google_identities mapping (should be none) ----
  const mappingSnap = await db.collection('google_identities').where('googleSubjectId', '==', uid).get();
  if (!mappingSnap.empty) {
    console.log('Found orphan google_identities documents:');
    mappingSnap.forEach(doc => console.log(` - ${doc.id}`));
  } else {
    console.log('No orphan google_identities documents found for this UID.');
  }

  // ---- STEP 4: Dry‑run report only ----
  if (!execute) {
    console.log('\nDRY‑RUN complete. No changes have been made.');
    return;
  }

  // ---- STEP 5: Execute deletion ----
  console.log('\n--- EXECUTING DELETION ---');
  try {
    await auth.deleteUser(uid);
    console.log(`Deleted Firebase Auth user UID=${uid}`);
  } catch (e) {
    console.error('Failed to delete Auth user:', e);
  }
  // Delete any stale google_identities docs (if any)
  for (const doc of mappingSnap.docs) {
    try {
      await doc.ref.delete();
      console.log(`Deleted stale google_identities doc ${doc.id}`);
    } catch (e) {
      console.error(`Failed to delete google_identities doc ${doc.id}:`, e);
    }
  }

  // ---- STEP 6: Post‑deletion verification ----
  console.log('\n--- POST‑DELETION VERIFICATION ---');
  // Verify Auth no longer contains the UID
  const postList = await auth.listUsers();
  const stillExists = postList.users.some(u => u.uid === uid);
  console.log(`Auth still contains UID after deletion? ${stillExists ? 'YES' : 'NO'}`);

  // Verify users collection unchanged (just count)
  const usersSnap = await db.collection('users').get();
  console.log(`Total users collection documents: ${usersSnap.size}`);

  // Verify CodeID allocator nextNumericValue (assuming a doc at counters/code_ids)
  const allocatorDoc = await db.collection('counters').doc('code_ids').get();
  if (allocatorDoc.exists) {
    const data = allocatorDoc.data();
    console.log(`CodeID allocator nextNumericValue: ${data?.nextNumericValue}`);
  } else {
    console.log('CodeID allocator document not found.');
  }

  // Verify timetables and quizzes unchanged (just show counts)
  const timetablesSnap = await db.collection('timetables').get();
  const quizzesSnap = await db.collection('quizzes').get();
  console.log(`Timetables documents count: ${timetablesSnap.size}`);
  console.log(`Quizzes documents count: ${quizzesSnap.size}`);

  console.log('\nCleanup and verification completed.');
}

main().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
