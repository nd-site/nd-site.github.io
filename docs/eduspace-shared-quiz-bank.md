# EduSpace shared quiz bank

Updated: 2026-09-28

## Source of truth

`quizzes/{quizId}` is the shared source for exam definitions used by EduSpace V2, EduSpace V3 and Admin Edu.

- Existing V2 exams keep their current `quizData` shape in that document.
- Native V3 exams store public metadata and the canonical exam definition in `eduspaceV3.exam` in the same document.
- Native V3 question snapshots and grading versions are stored below `quizzes/{quizId}/questionBank/{questionId}/versions/{versionId}`. These paths belong to the quiz aggregate; Firestore rules deny browser access to them. The V3 server reads them with Firebase Admin.
- `eduspace_lessons/{id}` holds non-quiz lesson content. Older quiz pointers remain for rollback/compatibility but are no longer written or used as the source of quiz metadata.
- `exam_sessions`, `submissions`, `grading_records` and `results` remain separate because they store individual exam activity, not exam definitions.

## Legacy V3 records

Older native V3 definitions were split across `exams`, `questions`, and `question_versions`. The V3 runner can still read those records during the migration window. In Admin Edu, use **Chuyển đề V3 cũ** to copy each exam and its referenced question versions into the shared quiz aggregate. The migration reports migrated records, existing shared-bank records, ID conflicts and failures. It leaves old records untouched for rollback. Legacy repository write methods now reject writes to these collections.

Do not remove the legacy collections until the migration report has no failures or unresolved ID conflicts and the copied exams have been checked in the runner.

## Data flows

- Admin Edu writes V2-format exams directly to `quizzes/{quizId}`; Admin Edu and the V2 catalog read that record directly.
- The V3 authoring API writes the exam and question versions beneath one `quizzes/{quizId}` aggregate.
- V2 links and Admin Edu actions recognize native V3 records and open the V3 runner or authoring page.
- The public V3 catalog API reads `quizzes` and returns exam metadata only. It does not return V3 question content or grading versions.
