export interface Stanza {
  stanzaIndex: number;
  lines: string[];
  rhythm: string;
  visualCue: string;
  rhymeMapping: Record<string, string>;
}

export type PoemVisibility = 'public' | 'unlisted' | 'private';

export interface Poem {
  id: string; // Mã hệ thống cấp chống trùng (cố định mãi mãi)
  slug?: string; // Mã bài được cấp hoặc tự nhập lúc đăng
  title: string;
  author: string;
  authorNdid?: string; // NDID tác giả tạo bài
  stanzas: Stanza[];
  genre?: string; // e.g. "Thơ 7 Chữ", "Thơ Tự Do", "Thơ Lục Bát", "Thơ Đường Luật"
  category?: string; // e.g. "Chương trình THPT", "Kinh Điển", "Tình Yêu", "Quê Hương"
  meaning?: string; // Phân tích nghệ thuật / bối cảnh văn học
  likesCount: number;
  likedBy: string[]; // danh sách user id đã thả tim
  savesCount: number;
  viewsCount: number;
  createdAt: string;
  createdBy: {
    uid: string;
    displayName: string;
    ndid?: string;
    avatar?: string;
  };
  isPublic: boolean;
  visibility?: PoemVisibility; // 'public' | 'unlisted' | 'private'
  isLocked?: boolean; // Khóa bài thơ: không cho sửa, không cho thêm nhận xét
  allowComments?: boolean; // Quyền nhận xét: cho phép hay tắt bình luận
  collaboratorNdids?: string[]; // Quyền sửa: danh sách NDID được phép sửa ngoài tác giả
  tags?: string[];
}

export type StudyMode = 'overview' | 'cloze' | 'first-letter' | 'rhythm' | 'flashcard' | 'scramble';

export interface StudyProgress {
  poemId: string;
  status: 'not_started' | 'learning' | 'mastered';
  masteryScore: number; // 0 - 100%
  lastPracticed: string;
  clozeScore?: number;
  firstLetterScore?: number;
  rhythmCompleted?: boolean;
  flashcardViewed?: boolean;
  scrambleCompleted?: boolean;
}

export interface Comment {
  id: string;
  poemId: string;
  userId: string;
  userName: string;
  ndid?: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  ndid?: string;
  avatar?: string;
  streakDays: number;
  savedPoemIds: string[];
  lastActiveDate: string;
  isAnonymous?: boolean;
}

export interface FirebaseConfigState {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}
