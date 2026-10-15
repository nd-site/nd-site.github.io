import React, { useState, useRef } from 'react';
import {
  PlayCircle,
  Download,
  CloudUpload,
  RefreshCw,
  Plus,
  ArrowUp,
  ArrowDown,
  Trash2,
  Sliders,
  Calculator,
  CheckSquare,
  Sparkles,
  Eye,
  EyeOff,
  Flame,
  Clock,
  Layers,
  BookOpen,
  Image as ImageIcon,
  Volume2,
  Film,
  Table as TableIcon,
  Tag,
  UserCheck,
  Users,
  Code,
  Columns2,
  Maximize2,
  Minimize2,
  Copy,
  Upload,
  AlertCircle,
  Printer,
  Database,
  BarChart3,
  Award,
} from 'lucide-react';
import { LatexRenderer } from './LatexRenderer';
import { AudioPlayer } from './AudioPlayer';
import { VideoEmbed } from './VideoEmbed';
import { ExamLivePreview } from './ExamLivePreview';
import { JsonCodeEditor } from './JsonCodeEditor';
import { TableModal } from './modals/TableModal';
import { PassageManagerModal } from './modals/PassageManagerModal';
import { ExportPdfModal } from './modals/ExportPdfModal';
import { QuestionBankModal } from './modals/QuestionBankModal';
import { ExamAnalyticsModal } from './modals/ExamAnalyticsModal';
import { RubricModal } from './modals/RubricModal';
import { saveQuestionToBank } from '../services/firebaseService';
import {
  extractTextFromDocx,
  parseQuestionsWithRegex,
  normalizeShortDecimalAnswer,
  isValidShortDecimalAnswer,
} from '../services/aiService';
import type {
  Question,
  ExamStructure,
  QuestionType,
  PassageContext,
  EduCategoriesConfig,
  AdminUser,
} from '../types';

interface EditorTabProps {
  user: AdminUser | null;
  categories: EduCategoriesConfig;

  // Metadata state
  pubId: string;
  setPubId: (val: string) => void;
  pubTitle: string;
  setPubTitle: (val: string) => void;
  pubClass: string;
  setPubClass: (val: string) => void;
  pubSubject: string;
  setPubSubject: (val: string) => void;
  examType: string;
  setExamType: (val: string) => void;
  matrixDuration: number;
  setMatrixDuration: (val: number) => void;
  fullDuration: number;
  setFullDuration: (val: number) => void;
  pubTag: string;
  setPubTag: (val: string) => void;
  metaAuthor: string;
  setMetaAuthor: (val: string) => void;
  collaborators: string[];
  setCollaborators: React.Dispatch<React.SetStateAction<string[]>>;
  metaYear: string;
  setMetaYear: (val: string) => void;
  metaSchool: string;
  setMetaSchool: (val: string) => void;
  metaBook: string;
  setMetaBook: (val: string) => void;
  pubDesc: string;
  setPubDesc: (val: string) => void;
  pubHot: boolean;
  setPubHot: (val: boolean) => void;
  pubComingSoon: boolean;
  setPubComingSoon: (val: boolean) => void;

  // Structure state
  structure: ExamStructure;
  setStructure: React.Dispatch<React.SetStateAction<ExamStructure>>;
  structPoints: {
    multiple: number;
    truefalse: number;
    short: number;
    essay: number;
    matching?: number;
    cloze?: number;
    ordering?: number;
  };
  setStructPoints: React.Dispatch<
    React.SetStateAction<{
      multiple: number;
      truefalse: number;
      short: number;
      essay: number;
      matching?: number;
      cloze?: number;
      ordering?: number;
    }>
  >;

  // Shared Passages & Questions
  passages: PassageContext[];
  setPassages: React.Dispatch<React.SetStateAction<PassageContext[]>>;
  questions: Question[];
  setQuestions: React.Dispatch<React.SetStateAction<Question[]>>;

  // Actions
  isPublishing: boolean;
  onPublish: () => void;
  onTestInRunner: () => void;
  onExportJson: () => void;

  // Modals
  onOpenAIGen: () => void;
  onOpenAIReview: () => void;
  onOpenAIExplanation: () => void;
  onToast: (msg: string, isError?: boolean) => void;
}

export const EditorTab: React.FC<EditorTabProps> = ({
  user,
  categories,
  pubId,
  setPubId,
  pubTitle,
  setPubTitle,
  pubClass,
  setPubClass,
  pubSubject,
  setPubSubject,
  examType,
  setExamType,
  matrixDuration,
  setMatrixDuration,
  fullDuration,
  setFullDuration,
  pubTag,
  setPubTag,
  metaAuthor,
  setMetaAuthor,
  collaborators,
  setCollaborators,
  metaYear,
  setMetaYear,
  metaSchool,
  setMetaSchool,
  metaBook,
  setMetaBook,
  pubDesc,
  setPubDesc,
  pubHot,
  setPubHot,
  pubComingSoon,
  setPubComingSoon,
  structure,
  setStructure,
  structPoints,
  setStructPoints,
  passages,
  setPassages,
  questions,
  setQuestions,
  isPublishing,
  onPublish,
  onTestInRunner,
  onExportJson,
  onOpenAIGen,
  onOpenAIReview,
  onOpenAIExplanation,
  onToast,
}) => {
  // Mode switcher: Visual Form vs JSON Code Editor
  const [editorViewMode, setEditorViewMode] = useState<'visual' | 'json'>('visual');
  const [collaboratorInput, setCollaboratorInput] = useState('');
  const [isPassageModalOpen, setIsPassageModalOpen] = useState(false);
  const [tableTargetIdx, setTableTargetIdx] = useState<number | null>(null);

  // New feature modals state
  const [isExportPdfOpen, setIsExportPdfOpen] = useState(false);
  const [isQuestionBankOpen, setIsQuestionBankOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [rubricTargetIdx, setRubricTargetIdx] = useState<number | null>(null);

  // Drag & Drop / Word Upload state
  const [isProcessingDocx, setIsProcessingDocx] = useState(false);
  const docxFileInputRef = useRef<HTMLInputElement>(null);
  const jsonFileInputRef = useRef<HTMLInputElement>(null);

  // Save question to question bank
  const handleSaveQuestionToBank = async (q: Question) => {
    try {
      await saveQuestionToBank({
        question: q,
        subject: pubSubject,
        grade: pubClass,
        creatorNdid: metaAuthor || userNdid || 'Tác giả',
        topic: pubSubject,
      });
      onToast('Đã lưu câu hỏi vào ngân hàng câu hỏi dùng chung!');
    } catch (err: any) {
      onToast('Lỗi khi lưu vào ngân hàng: ' + (err?.message || err), true);
    }
  };

  // Check if current user is Admin / Owner
  const isAdmin =
    user?.adminLevel === 'owner' || user?.role === 'admin' || user?.adminLevel === 'admin';

  // NDID of current user
  const userNdid = user?.ndid || user?.uid || '';

  // Generate random slug ID
  const handleGenRandomId = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let res = '';
    for (let i = 0; i < 6; i++) {
      res += chars[Math.floor(Math.random() * chars.length)];
    }
    setPubId(res);
  };

  // Tag myself as author
  const handleTagMyself = () => {
    if (userNdid) {
      setMetaAuthor(userNdid);
      onToast(`Đã gắn thẻ bản thân: ${userNdid}`);
    } else {
      onToast('Chưa xác định được tài khoản người dùng.', true);
    }
  };

  // Add collaborator
  const handleAddCollaborator = () => {
    const trimmed = collaboratorInput.trim();
    if (!trimmed) return;

    // Quy chuẩn NDID: validate regex /^[a-zA-Z0-9_.]+$/ trên form người dùng tự nhập
    const ndidRegex = /^[a-zA-Z0-9_.]+$/;
    if (!ndidRegex.test(trimmed)) {
      onToast('NDID chỉ được chứa các ký tự chữ, số, dấu gạch dưới và dấu chấm.', true);
      return;
    }

    if (collaborators.includes(trimmed)) {
      onToast('Cộng tác viên này đã có trong danh sách.', true);
      return;
    }

    setCollaborators((prev) => [...prev, trimmed]);
    setCollaboratorInput('');
    onToast(`Đã thêm cộng tác viên: ${trimmed}`);
  };

  const handleRemoveCollaborator = (ndid: string) => {
    setCollaborators((prev) => prev.filter((c) => c !== ndid));
  };

  // Upload Word .docx via Mammoth
  const handleDocxFile = async (file: File) => {
    if (!file.name.endsWith('.docx')) {
      onToast('Vui lòng chọn tệp Word định dạng .docx.', true);
      return;
    }

    setIsProcessingDocx(true);
    try {
      onToast('Đang đọc dữ liệu từ tệp Word...', false);
      const text = await extractTextFromDocx(file);
      const parsed = parseQuestionsWithRegex(text);
      if (parsed.length === 0) {
        onToast('Không bóc tách được câu hỏi nào từ tệp. Bạn có thể dùng chế độ JSON.', true);
      } else {
        setQuestions((prev) => [...prev, ...parsed]);
        onToast(`Đã nạp thành công ${parsed.length} câu hỏi từ tệp "${file.name}"!`);
      }
    } catch (e: any) {
      onToast('Lỗi đọc tệp Word: ' + (e?.message || e), true);
    } finally {
      setIsProcessingDocx(false);
    }
  };

  // Upload JSON file directly
  const handleJsonFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);

        if (parsed.title) setPubTitle(parsed.title);
        if (parsed.grade || parsed.class) setPubClass(parsed.grade || parsed.class);
        if (parsed.subject) setPubSubject(parsed.subject);
        if (parsed.examType) setExamType(parsed.examType);
        if (parsed.author) setMetaAuthor(parsed.author);
        if (Array.isArray(parsed.collaborators)) setCollaborators(parsed.collaborators);
        if (parsed.matrixDuration) setMatrixDuration(parsed.matrixDuration);
        if (parsed.fullDuration) setFullDuration(parsed.fullDuration);
        if (parsed.examStructure || parsed.structure) {
          setStructure(parsed.examStructure || parsed.structure);
        }
        if (Array.isArray(parsed.passages)) setPassages(parsed.passages);

        let qs: Question[] = [];
        if (Array.isArray(parsed)) {
          qs = parsed;
        } else if (Array.isArray(parsed.questions)) {
          qs = parsed.questions;
        }

        if (qs.length > 0) {
          setQuestions((prev) => [...prev, ...qs]);
          onToast(`Đã nạp ${qs.length} câu hỏi từ tệp JSON "${file.name}"!`);
        } else {
          onToast('Không tìm thấy danh sách câu hỏi trong tệp JSON.', true);
        }
      } catch (err: any) {
        onToast('Tệp không đúng định dạng JSON: ' + err.message, true);
      }
    };
    reader.readAsText(file);
  };

  // Add new question
  const handleAddQuestion = (type: QuestionType) => {
    let newQ: Question;
    if (type === 'multiple') {
      newQ = {
        type: 'multiple',
        question: 'Nội dung câu hỏi trắc nghiệm mới...',
        options: ['', '', '', ''],
        correct: 0,
        points: structPoints.multiple,
        explanation: '',
      };
    } else if (type === 'truefalse') {
      newQ = {
        type: 'truefalse',
        question: 'Xét tính đúng sai của các mệnh đề sau:',
        options: ['', '', '', ''],
        correctAnswers: [true, false, false, false],
        points: structPoints.truefalse,
        explanation: '',
      };
    } else if (type === 'short') {
      newQ = {
        type: 'short',
        question: 'Nội dung câu hỏi trả lời ngắn / điền số...',
        correct: '',
        points: structPoints.short,
        explanation: '',
      };
    } else if (type === 'matching') {
      newQ = {
        type: 'matching',
        question: 'Nối các cặp thông tin tương ứng giữa Cột A và Cột B:',
        pairs: [
          { id: '1', left: 'Khái niệm 1', right: 'Định nghĩa 1' },
          { id: '2', left: 'Khái niệm 2', right: 'Định nghĩa 2' },
          { id: '3', left: 'Khái niệm 3', right: 'Định nghĩa 3' },
        ],
        points: structPoints.matching || 1.0,
        explanation: '',
      };
    } else if (type === 'cloze') {
      newQ = {
        type: 'cloze',
        question: 'Điền từ / cụm từ thích hợp vào các chỗ trống [1], [2]:\nĐoạn văn với vị trí cần điền [1] và vị trí tiếp theo [2].',
        blanks: [
          { id: '1', options: ['Lựa chọn A', 'Lựa chọn B'], correct: 'Lựa chọn A' },
          { id: '2', options: ['Lựa chọn C', 'Lựa chọn D'], correct: 'Lựa chọn C' },
        ],
        points: structPoints.cloze || 1.0,
        explanation: '',
      };
    } else if (type === 'ordering') {
      newQ = {
        type: 'ordering',
        question: 'Sắp xếp các bước sau theo đúng trình tự logic chuẩn:',
        items: [
          { id: 'step_1', text: 'Bước thứ nhất: Chuẩn bị' },
          { id: 'step_2', text: 'Bước thứ hai: Tiến hành' },
          { id: 'step_3', text: 'Bước thứ ba: Đánh giá kết quả' },
        ],
        points: structPoints.ordering || 1.0,
        explanation: '',
      };
    } else {
      newQ = {
        type: 'essay',
        question: 'Nội dung câu hỏi tự luận...',
        correct: '',
        points: structPoints.essay,
        explanation: '',
        allowAttachments: true,
      };
    }
    setQuestions((prev) => [...prev, newQ]);
  };

  const handleAddPassageQuestionGroup = () => {
    const passageId = `p_${Date.now().toString(36)}`;
    const pTitle = `Ngữ liệu ${passages.length + 1} (Đọc hiểu)`;
    const newPassage: PassageContext = {
      id: passageId,
      title: pTitle,
      content: 'Nhập nội dung bài đọc, tài liệu tình huống dùng chung cho các câu hỏi bên dưới...',
      shuffleQuestions: true,
    };
    setPassages((prev) => [...prev, newPassage]);

    const groupQs: Question[] = [
      {
        type: 'multiple',
        question: `Dựa vào ${pTitle}: Ý chính của đoạn trích là gì?`,
        options: ['Phương án A', 'Phương án B', 'Phương án C', 'Phương án D'],
        correct: 0,
        points: structPoints.multiple,
        passageId: passageId,
      },
      {
        type: 'multiple',
        question: `Dựa vào ${pTitle}: Chi tiết nào dưới đây được đề cập trong bài?`,
        options: ['Phương án A', 'Phương án B', 'Phương án C', 'Phương án D'],
        correct: 1,
        points: structPoints.multiple,
        passageId: passageId,
      },
      {
        type: 'multiple',
        question: `Dựa vào ${pTitle}: Nhận định nào sau đây có thể suy luận được?`,
        options: ['Phương án A', 'Phương án B', 'Phương án C', 'Phương án D'],
        correct: 2,
        points: structPoints.multiple,
        passageId: passageId,
      },
    ];

    setQuestions((prev) => [...prev, ...groupQs]);
    onToast(`Đã thêm ${pTitle} kèm 3 câu hỏi trắc nghiệm dùng chung ngữ liệu.`);
  };

  const handleDuplicateQuestion = (idx: number) => {
    const clone = JSON.parse(JSON.stringify(questions[idx]));
    setQuestions((prev) => {
      const next = [...prev];
      next.splice(idx + 1, 0, clone);
      return next;
    });
  };

  const handleRemoveQuestion = (idx: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleMoveQuestion = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= questions.length) return;
    setQuestions((prev) => {
      const next = [...prev];
      const temp = next[idx];
      next[idx] = next[target];
      next[target] = temp;
      return next;
    });
  };

  const handleInsertTableInQuestion = (mdTable: string) => {
    if (tableTargetIdx === null) return;
    setQuestions((prev) => {
      const next = [...prev];
      const q = next[tableTargetIdx];
      if (q) {
        next[tableTargetIdx] = { ...q, question: (q.question || '') + '\n' + mdTable };
      }
      return next;
    });
    setTableTargetIdx(null);
  };

  // Auto distribute points for standard 10.0 scale
  const handleAutoDistributePoints = () => {
    if (questions.length === 0) return;
    const mCount = questions.filter((q) => q.type === 'multiple').length;
    const tfCount = questions.filter((q) => q.type === 'truefalse').length;
    const sCount = questions.filter((q) => q.type === 'short').length;
    const matchCount = questions.filter((q) => q.type === 'matching').length;
    const clozeCount = questions.filter((q) => q.type === 'cloze').length;
    const orderCount = questions.filter((q) => q.type === 'ordering').length;
    const eCount = questions.filter((q) => q.type === 'essay').length;

    let targetM = 0.25;
    let targetTf = 1.0;
    let targetS = 0.5;
    let targetMatch = 1.0;
    let targetCloze = 1.0;
    let targetOrder = 1.0;
    let targetE = 2.0;

    const standardTotal =
      mCount * targetM +
      tfCount * targetTf +
      sCount * targetS +
      matchCount * targetMatch +
      clozeCount * targetCloze +
      orderCount * targetOrder +
      eCount * targetE;

    if (standardTotal > 0) {
      const ratio = 10.0 / standardTotal;
      targetM = Math.round(targetM * ratio * 100) / 100;
      targetTf = Math.round(targetTf * ratio * 100) / 100;
      targetS = Math.round(targetS * ratio * 100) / 100;
      targetMatch = Math.round(targetMatch * ratio * 100) / 100;
      targetCloze = Math.round(targetCloze * ratio * 100) / 100;
      targetOrder = Math.round(targetOrder * ratio * 100) / 100;
      targetE = Math.round(targetE * ratio * 100) / 100;
    }

    setStructPoints({
      multiple: targetM,
      truefalse: targetTf,
      short: targetS,
      essay: targetE,
      matching: targetMatch,
      cloze: targetCloze,
      ordering: targetOrder,
    });

    setQuestions((prev) =>
      prev.map((q) => {
        let p = targetM;
        if (q.type === 'truefalse') p = targetTf;
        else if (q.type === 'short') p = targetS;
        else if (q.type === 'matching') p = targetMatch;
        else if (q.type === 'cloze') p = targetCloze;
        else if (q.type === 'ordering') p = targetOrder;
        else if (q.type === 'essay') p = targetE;
        return { ...q, points: p };
      })
    );
    onToast('Đã tính toán và phân bổ lại điểm số chuẩn theo tỷ lệ thang điểm 10.');
  };

  // Calculate points
  const totalPoints = questions.reduce((sum, q) => {
    const p =
      q.points !== undefined
        ? Number(q.points)
        : q.type === 'truefalse'
        ? structPoints.truefalse
        : q.type === 'short'
        ? structPoints.short
        : q.type === 'matching'
        ? (structPoints.matching || 1.0)
        : q.type === 'cloze'
        ? (structPoints.cloze || 1.0)
        : q.type === 'ordering'
        ? (structPoints.ordering || 1.0)
        : q.type === 'essay'
        ? structPoints.essay
        : structPoints.multiple;
    return sum + (isNaN(p) ? 0 : p);
  }, 0);
  const roundedPoints = Math.round(totalPoints * 100) / 100;

  return (
    <div className="space-y-4 animate-in fade-in pb-16">
      {/* Top Action Bar */}
      <div className="bg-white rounded-3xl p-4 md:p-5 shadow-sm border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* View Mode Toggle */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl w-fit">
          <button
            type="button"
            onClick={() => setEditorViewMode('visual')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
              editorViewMode === 'visual'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Columns2 className="w-3.5 h-3.5" />
            <span>Trình tạo trực quan</span>
          </button>

          <button
            type="button"
            onClick={() => setEditorViewMode('json')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
              editorViewMode === 'json'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Viết mã JSON</span>
          </button>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Test in runner simulator */}
          <button
            type="button"
            onClick={onTestInRunner}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-extrabold text-xs rounded-xl border border-emerald-200 transition-all cursor-pointer"
          >
            <PlayCircle className="w-4 h-4 text-emerald-600" />
            <span>Thử làm đề này</span>
          </button>

          {/* Export / Print PDF */}
          <button
            type="button"
            onClick={() => setIsExportPdfOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
            title="In hoặc xuất file PDF đề thi và phiếu làm bài chuẩn"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>In / Xuất PDF</span>
          </button>

          {/* Question Bank */}
          <button
            type="button"
            onClick={() => setIsQuestionBankOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200 transition-all cursor-pointer"
            title="Mở thư viện ngân hàng câu hỏi"
          >
            <Database className="w-4 h-4 text-indigo-600" />
            <span>Ngân hàng câu hỏi</span>
          </button>

          {/* Exam Analytics */}
          <button
            type="button"
            onClick={() => setIsAnalyticsOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs rounded-xl border border-amber-200 transition-all cursor-pointer"
            title="Phân tích độ phân hóa và phổ điểm dự báo"
          >
            <BarChart3 className="w-4 h-4 text-amber-600" />
            <span>Phổ điểm dự báo</span>
          </button>

          {/* Export JSON */}
          <button
            type="button"
            onClick={onExportJson}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
            title="Tải tệp JSON về máy"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Xuất JSON</span>
          </button>

          {/* Publish to Cloud */}
          <button
            type="button"
            onClick={onPublish}
            disabled={isPublishing}
            className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <CloudUpload className="w-4 h-4" />
            <span>{isPublishing ? 'Đang lưu...' : 'Lưu & Xuất bản'}</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Split View: Left (Builder / JSON) & Right (Live Preview) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        {/* LEFT COLUMN: Visual Builder OR JSON Code Editor */}
        <div className="space-y-4">
          {editorViewMode === 'json' ? (
            <JsonCodeEditor
              quizTitle={pubTitle}
              grade={pubClass}
              subject={pubSubject}
              examType={examType}
              author={metaAuthor}
              collaborators={collaborators}
              matrixDuration={matrixDuration}
              fullDuration={fullDuration}
              structure={structure}
              passages={passages}
              questions={questions}
              onApplyJson={(payload) => {
                if (payload.quizTitle) setPubTitle(payload.quizTitle);
                if (payload.grade) setPubClass(payload.grade);
                if (payload.subject) setPubSubject(payload.subject);
                if (payload.examType) setExamType(payload.examType);
                if (payload.author !== undefined) setMetaAuthor(payload.author);
                if (Array.isArray(payload.collaborators)) setCollaborators(payload.collaborators);
                if (payload.matrixDuration) setMatrixDuration(payload.matrixDuration);
                if (payload.fullDuration) setFullDuration(payload.fullDuration);
                if (payload.structure) setStructure(payload.structure);
                if (Array.isArray(payload.passages)) setPassages(payload.passages);
                setQuestions(payload.questions);
              }}
              onToast={onToast}
            />
          ) : (
            <>
              {/* Exam Metadata Card */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-extrabold text-slate-900 text-sm">Thông Tin Đề Thi</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-500">Mã đề:</span>
                    <input
                      type="text"
                      value={pubId}
                      onChange={(e) => setPubId(e.target.value.toLowerCase())}
                      placeholder="Mã đề (slug)..."
                      className="w-28 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800"
                    />
                    <button
                      type="button"
                      onClick={handleGenRandomId}
                      className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                    >
                      Tạo ngẫu nhiên
                    </button>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Tiêu đề bài kiểm tra
                  </label>
                  <input
                    type="text"
                    value={pubTitle}
                    onChange={(e) => setPubTitle(e.target.value)}
                    placeholder="VD: Đề thi thử tốt nghiệp THPT Quốc gia 2026 - Môn Toán..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Dropdowns: Subject, Grade, Exam Type (Strictly selected from predefined categories) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Môn học
                    </label>
                    <select
                      value={pubSubject}
                      onChange={(e) => setPubSubject(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- Chọn môn học --</option>
                      {categories.subjects.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Khối lớp
                    </label>
                    <select
                      value={pubClass}
                      onChange={(e) => setPubClass(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- Chọn khối lớp --</option>
                      {categories.grades.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Loại bài kiểm tra
                    </label>
                    <select
                      value={examType}
                      onChange={(e) => setExamType(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- Chọn loại kiểm tra --</option>
                      {categories.examTypes.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Author & Collaborators */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* Author */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-slate-600">
                        Tác giả / Người ra đề
                      </label>
                      <button
                        type="button"
                        onClick={handleTagMyself}
                        className="flex items-center gap-1 text-[10px] font-extrabold text-blue-600 hover:underline cursor-pointer"
                      >
                        <UserCheck className="w-3 h-3" />
                        <span>Gắn thẻ bản thân</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      value={metaAuthor}
                      onChange={(e) => setMetaAuthor(e.target.value)}
                      placeholder="Có thể để trống hoặc tên tác giả..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Collaborators */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Thêm cộng tác viên (có quyền sửa đề)
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={collaboratorInput}
                        onChange={(e) => setCollaboratorInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddCollaborator()}
                        placeholder="Nhập NDID cộng tác viên..."
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={handleAddCollaborator}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl transition-all cursor-pointer"
                      >
                        Thêm
                      </button>
                    </div>

                    {/* Collaborator chips */}
                    {collaborators.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {collaborators.map((c) => (
                          <span
                            key={c}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold"
                          >
                            <Users className="w-3 h-3 text-blue-500" />
                            <span>{c}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveCollaborator(c)}
                              className="hover:text-rose-600 ml-0.5"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Admin Only Toggles: Hot & Coming Soon */}
                {isAdmin && (
                  <div className="flex items-center gap-6 pt-2 border-t border-slate-100">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pubHot}
                        onChange={(e) => setPubHot(e.target.checked)}
                        className="rounded text-amber-500 focus:ring-amber-500 w-4 h-4"
                      />
                      <span className="flex items-center gap-1 text-amber-600 font-extrabold">
                        <Flame className="w-3.5 h-3.5" />
                        <span>Đề thi nổi bật (Hot)</span>
                      </span>
                    </label>

                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pubComingSoon}
                        onChange={(e) => setPubComingSoon(e.target.checked)}
                        className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4"
                      />
                      <span className="text-purple-600 font-extrabold">Sắp ra mắt</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Ma trận kiểm tra (Mặc định hiển thị, cấu hình số phút tách riêng) */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Sliders className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-xs">Ma Trận Kiểm Tra</h3>
                      <p className="text-[10px] text-slate-400">
                        Cấu hình rút câu ngẫu nhiên và thời gian thi tương ứng
                      </p>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-xs font-extrabold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={structure.enabled}
                      onChange={(e) =>
                        setStructure((prev) => ({ ...prev, enabled: e.target.checked }))
                      }
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span>Kích hoạt Ma trận</span>
                  </label>
                </div>

                {/* Exam Preset Quick Selectors */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold text-slate-700">
                      Áp dụng cấu trúc chuẩn Việt Nam:
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Tự động điền ma trận & thời gian thi
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        setExamType('Thi thử tốt nghiệp THPT');
                        setMatrixDuration(50);
                        setFullDuration(90);
                        setStructure((prev) => ({
                          ...prev,
                          enabled: true,
                          counts: {
                            multiple: 12,
                            truefalse: 4,
                            short: 6,
                            essay: 0,
                            matching: 0,
                            cloze: 0,
                            ordering: 0,
                          },
                        }));
                        setStructPoints((prev) => ({
                          ...prev,
                          multiple: 0.25,
                          truefalse: 1.0,
                          short: 0.5,
                          essay: 2.0,
                        }));
                        onToast('Đã áp dụng mẫu chuẩn THPT GDPT 2018 (12 TN + 4 Đ/S + 6 Điền số, 50p).');
                      }}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-[11px] rounded-lg transition-all cursor-pointer"
                    >
                      GDPT 2018 (50p)
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setExamType('ĐGNL ĐHQGHN (HSA)');
                        setMatrixDuration(75);
                        setFullDuration(120);
                        setStructure((prev) => ({
                          ...prev,
                          enabled: true,
                          counts: {
                            multiple: 35,
                            truefalse: 0,
                            short: 15,
                            essay: 0,
                            matching: 0,
                            cloze: 0,
                            ordering: 0,
                          },
                        }));
                        setStructPoints((prev) => ({
                          ...prev,
                          multiple: 0.2,
                          short: 0.2,
                        }));
                        onToast('Đã áp dụng mẫu ĐGNL ĐHQG Hà Nội (HSA: 35 TN + 15 Điền số, 75p).');
                      }}
                      className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-extrabold text-[11px] rounded-lg border border-blue-200 transition-all cursor-pointer"
                    >
                      ĐGNL HSA Hà Nội (75p)
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setExamType('ĐGNL ĐHQG-HCM (APT)');
                        setMatrixDuration(150);
                        setFullDuration(180);
                        setStructure((prev) => ({
                          ...prev,
                          enabled: true,
                          counts: {
                            multiple: 40,
                            truefalse: 0,
                            short: 0,
                            essay: 0,
                            matching: 0,
                            cloze: 0,
                            ordering: 0,
                          },
                        }));
                        setStructPoints((prev) => ({
                          ...prev,
                          multiple: 0.25,
                        }));
                        onToast('Đã áp dụng mẫu ĐGNL ĐHQG TP.HCM (APT: 40 câu theo cụm ngữ liệu, 150p).');
                      }}
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-extrabold text-[11px] rounded-lg border border-emerald-200 transition-all cursor-pointer"
                    >
                      ĐGNL APT TP.HCM (150p)
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setExamType('ĐGTD ĐHBK Hà Nội (TSA)');
                        setMatrixDuration(60);
                        setFullDuration(90);
                        setStructure((prev) => ({
                          ...prev,
                          enabled: true,
                          counts: {
                            multiple: 20,
                            truefalse: 5,
                            short: 5,
                            essay: 0,
                            matching: 2,
                            cloze: 2,
                            ordering: 0,
                          },
                        }));
                        onToast('Đã áp dụng mẫu Đánh giá Tư duy ĐHBK Hà Nội (TSA: 60p).');
                      }}
                      className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 font-extrabold text-[11px] rounded-lg border border-purple-200 transition-all cursor-pointer"
                    >
                      ĐGTD TSA Bách Khoa (60p)
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setExamType('Học sinh giỏi / Olympic');
                        setMatrixDuration(120);
                        setFullDuration(180);
                        setStructure((prev) => ({
                          ...prev,
                          enabled: true,
                          counts: {
                            multiple: 0,
                            truefalse: 0,
                            short: 0,
                            essay: 5,
                            matching: 0,
                            cloze: 0,
                            ordering: 0,
                          },
                        }));
                        setStructPoints((prev) => ({
                          ...prev,
                          essay: 2.0,
                        }));
                        onToast('Đã áp dụng mẫu Đề HSG / Olympic (5 câu tự luận chuyên sâu, 120p).');
                      }}
                      className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 font-extrabold text-[11px] rounded-lg border border-amber-200 transition-all cursor-pointer"
                    >
                      HSG / Olympic (120p)
                    </button>
                  </div>
                </div>

                {/* Duration Config (Matrix duration vs Full duration) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-blue-50/50 rounded-2xl border border-blue-100">
                  <div>
                    <label className="block text-[11px] font-extrabold text-blue-900 mb-1">
                      Thời gian chế độ kiểm tra (theo ma trận)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={5}
                        max={300}
                        value={matrixDuration}
                        onChange={(e) => setMatrixDuration(parseInt(e.target.value) || 45)}
                        className="w-24 px-3 py-1.5 bg-white border border-blue-200 rounded-xl text-xs font-black text-blue-900 text-center"
                      />
                      <span className="text-xs font-bold text-blue-700">phút</span>
                    </div>
                    <span className="text-[10px] text-blue-600 block mt-1 font-medium">
                      * Thời gian hiển thị ở trang chọn đề sẽ lấy theo cấu hình này.
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                      Thời gian chế độ tất cả các câu (Luyện tập)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={5}
                        max={300}
                        value={fullDuration}
                        onChange={(e) => setFullDuration(parseInt(e.target.value) || 90)}
                        className="w-24 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-800 text-center"
                      />
                      <span className="text-xs font-bold text-slate-600">phút</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-1 font-medium">
                      Dành cho học sinh làm toàn bộ câu hỏi trong kho đề.
                    </span>
                  </div>
                </div>

                {/* Question Counts per Section */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-1">
                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 text-center">
                    <span className="block text-[10px] font-bold text-slate-500 uppercase">
                      I. Trắc nghiệm
                    </span>
                    <input
                      type="number"
                      min={0}
                      disabled={!structure.enabled}
                      value={structure.counts.multiple}
                      onChange={(e) =>
                        setStructure((prev) => ({
                          ...prev,
                          counts: { ...prev.counts, multiple: parseInt(e.target.value) || 0 },
                        }))
                      }
                      className="w-14 mt-1 text-center py-1 bg-white border border-slate-300 rounded-lg text-xs font-black disabled:opacity-50"
                    />
                  </div>

                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 text-center">
                    <span className="block text-[10px] font-bold text-slate-500 uppercase">
                      II. Đúng/Sai
                    </span>
                    <input
                      type="number"
                      min={0}
                      disabled={!structure.enabled}
                      value={structure.counts.truefalse}
                      onChange={(e) =>
                        setStructure((prev) => ({
                          ...prev,
                          counts: { ...prev.counts, truefalse: parseInt(e.target.value) || 0 },
                        }))
                      }
                      className="w-14 mt-1 text-center py-1 bg-white border border-slate-300 rounded-lg text-xs font-black disabled:opacity-50"
                    />
                  </div>

                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 text-center">
                    <span className="block text-[10px] font-bold text-slate-500 uppercase">
                      III. Điền số
                    </span>
                    <input
                      type="number"
                      min={0}
                      disabled={!structure.enabled}
                      value={structure.counts.short}
                      onChange={(e) =>
                        setStructure((prev) => ({
                          ...prev,
                          counts: { ...prev.counts, short: parseInt(e.target.value) || 0 },
                        }))
                      }
                      className="w-14 mt-1 text-center py-1 bg-white border border-slate-300 rounded-lg text-xs font-black disabled:opacity-50"
                    />
                  </div>

                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 text-center">
                    <span className="block text-[10px] font-bold text-slate-500 uppercase">
                      IV. Nối cặp
                    </span>
                    <input
                      type="number"
                      min={0}
                      disabled={!structure.enabled}
                      value={structure.counts.matching ?? 0}
                      onChange={(e) =>
                        setStructure((prev) => ({
                          ...prev,
                          counts: { ...prev.counts, matching: parseInt(e.target.value) || 0 },
                        }))
                      }
                      className="w-14 mt-1 text-center py-1 bg-white border border-slate-300 rounded-lg text-xs font-black disabled:opacity-50"
                    />
                  </div>

                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 text-center">
                    <span className="block text-[10px] font-bold text-slate-500 uppercase">
                      V. Điền khuyết
                    </span>
                    <input
                      type="number"
                      min={0}
                      disabled={!structure.enabled}
                      value={structure.counts.cloze ?? 0}
                      onChange={(e) =>
                        setStructure((prev) => ({
                          ...prev,
                          counts: { ...prev.counts, cloze: parseInt(e.target.value) || 0 },
                        }))
                      }
                      className="w-14 mt-1 text-center py-1 bg-white border border-slate-300 rounded-lg text-xs font-black disabled:opacity-50"
                    />
                  </div>

                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 text-center">
                    <span className="block text-[10px] font-bold text-slate-500 uppercase">
                      VI. Sắp xếp
                    </span>
                    <input
                      type="number"
                      min={0}
                      disabled={!structure.enabled}
                      value={structure.counts.ordering ?? 0}
                      onChange={(e) =>
                        setStructure((prev) => ({
                          ...prev,
                          counts: { ...prev.counts, ordering: parseInt(e.target.value) || 0 },
                        }))
                      }
                      className="w-14 mt-1 text-center py-1 bg-white border border-slate-300 rounded-lg text-xs font-black disabled:opacity-50"
                    />
                  </div>

                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 text-center">
                    <span className="block text-[10px] font-bold text-slate-500 uppercase">
                      VII. Tự luận
                    </span>
                    <input
                      type="number"
                      min={0}
                      disabled={!structure.enabled}
                      value={structure.counts.essay}
                      onChange={(e) =>
                        setStructure((prev) => ({
                          ...prev,
                          counts: { ...prev.counts, essay: parseInt(e.target.value) || 0 },
                        }))
                      }
                      className="w-14 mt-1 text-center py-1 bg-white border border-slate-300 rounded-lg text-xs font-black disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <label className="flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={structure.shuffleWithinType}
                      disabled={!structure.enabled}
                      onChange={(e) =>
                        setStructure((prev) => ({ ...prev, shuffleWithinType: e.target.checked }))
                      }
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 disabled:opacity-50"
                    />
                    <span>Xáo trộn ngẫu nhiên thứ tự câu hỏi trong từng phần</span>
                  </label>

                  <button
                    type="button"
                    onClick={handleAutoDistributePoints}
                    className="flex items-center gap-1 font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    <Calculator className="w-3.5 h-3.5" />
                    <span>Tự chia đều điểm tròn 10.0</span>
                  </button>
                </div>
              </div>

              {/* Import & Tools Bar */}
              <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-sm flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Upload JSON file */}
                  <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition-all">
                    <Upload className="w-3.5 h-3.5 text-purple-600" />
                    <span>Tải tệp JSON</span>
                    <input
                      ref={jsonFileInputRef}
                      type="file"
                      accept=".json"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleJsonFileUpload(f);
                        e.target.value = '';
                      }}
                      className="hidden"
                    />
                  </label>

                  {/* Upload Word .docx */}
                  <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition-all">
                    <Upload className="w-3.5 h-3.5 text-blue-600" />
                    <span>{isProcessingDocx ? 'Đang đọc Word...' : 'Tải Word .docx'}</span>
                    <input
                      ref={docxFileInputRef}
                      type="file"
                      accept=".docx"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleDocxFile(f);
                        e.target.value = '';
                      }}
                      className="hidden"
                    />
                  </label>

                  {/* Manage Shared Passages */}
                  <button
                    type="button"
                    onClick={() => setIsPassageModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-xs rounded-xl border border-indigo-200 transition-all cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Ngữ liệu chung ({passages.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAddPassageQuestionGroup}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
                    title="Tạo mới một ngữ liệu kèm 3 câu hỏi trắc nghiệm dùng chung"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>+ Chùm câu theo ngữ liệu</span>
                  </button>
                </div>

                {/* AI Tools */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onOpenAIGen}
                    className="flex items-center gap-1 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs rounded-xl border border-purple-200 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    <span>AI Sinh đề</span>
                  </button>

                  <button
                    type="button"
                    onClick={onOpenAIReview}
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    <span>Thẩm định AI</span>
                  </button>
                </div>
              </div>

              {/* Questions List Header */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    Danh Sách Câu Hỏi ({questions.length})
                  </h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-black ${
                      Math.abs(roundedPoints - 10.0) < 0.01
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    Tổng: {roundedPoints} / 10.0 điểm
                  </span>
                </div>

                {/* Quick Add Buttons */}
                <div className="flex items-center gap-1 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleAddQuestion('multiple')}
                    className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-extrabold text-[11px] rounded-lg cursor-pointer"
                  >
                    + Trắc nghiệm
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddQuestion('truefalse')}
                    className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-[11px] rounded-lg cursor-pointer"
                  >
                    + Đúng/Sai
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddQuestion('short')}
                    className="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 font-extrabold text-[11px] rounded-lg cursor-pointer"
                  >
                    + Điền số
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddQuestion('matching')}
                    className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 font-extrabold text-[11px] rounded-lg border border-amber-200 cursor-pointer"
                  >
                    + Nối cặp
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddQuestion('cloze')}
                    className="px-2 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 font-extrabold text-[11px] rounded-lg border border-teal-200 cursor-pointer"
                  >
                    + Điền khuyết
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddQuestion('ordering')}
                    className="px-2 py-1 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 font-extrabold text-[11px] rounded-lg border border-cyan-200 cursor-pointer"
                  >
                    + Sắp xếp
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddQuestion('essay')}
                    className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-extrabold text-[11px] rounded-lg cursor-pointer"
                  >
                    + Tự luận
                  </button>
                </div>
              </div>

              {/* Question Cards */}
              <div className="space-y-4">
                {questions.map((q, idx) => (
                  <div
                    key={idx}
                    className={`bg-white rounded-3xl p-5 border shadow-sm space-y-3 transition-all ${
                      q.passageId ? 'border-indigo-200 ring-1 ring-indigo-100' : 'border-slate-200/90'
                    }`}
                  >
                    {/* Header banner if question belongs to a passage */}
                    {q.passageId && (
                      <div className="flex items-center justify-between px-4 py-2 bg-indigo-50/90 border-b border-indigo-100 text-xs font-bold text-indigo-950 -mx-5 -mt-5 mb-3 rounded-t-3xl">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <BookOpen className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span>
                            Thuộc ngữ liệu: <b>{passages.find((p) => p.id === q.passageId)?.title || q.passageId}</b>
                          </span>
                          <span className="text-[10px] text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full font-semibold">
                            Hiển thị chung một trang cùng bài đọc
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setQuestions((prev) => {
                              const next = [...prev];
                              next[idx] = { ...next[idx], passageId: undefined };
                              return next;
                            });
                          }}
                          className="text-[10px] text-indigo-600 hover:text-rose-600 font-bold underline cursor-pointer"
                        >
                          Tách thành câu độc lập
                        </button>
                      </div>
                    )}

                    {/* Header of question card */}
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-extrabold uppercase">
                          {q.type === 'multiple'
                            ? 'Trắc nghiệm'
                            : q.type === 'truefalse'
                            ? 'Đúng / Sai'
                            : q.type === 'short'
                            ? 'Điền số'
                            : q.type === 'matching'
                            ? 'Nối cặp'
                            : q.type === 'cloze'
                            ? 'Điền khuyết'
                            : q.type === 'ordering'
                            ? 'Sắp xếp'
                            : 'Tự luận'}
                        </span>

                        {/* Passage Picker: always available */}
                        <select
                          value={q.passageId || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === '__new__') {
                              setIsPassageModalOpen(true);
                              return;
                            }
                            setQuestions((prev) => {
                              const next = [...prev];
                              next[idx] = { ...next[idx], passageId: val || undefined };
                              return next;
                            });
                          }}
                          className={`px-2 py-1 text-[10px] font-extrabold rounded-lg border transition-all cursor-pointer ${
                            q.passageId
                              ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                              : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          <option value="">(Câu độc lập - Không dùng ngữ liệu)</option>
                          {passages.map((p) => (
                            <option key={p.id} value={p.id}>
                              📖 {p.title || p.id}
                            </option>
                          ))}
                          <option value="__new__">+ Quản lý / Tạo ngữ liệu mới...</option>
                        </select>
                      </div>

                      {/* Card manipulation buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveQuestion(idx, -1)}
                          disabled={idx === 0}
                          className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveQuestion(idx, 1)}
                          disabled={idx === questions.length - 1}
                          className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        {/* Essay Rubric button */}
                        {q.type === 'essay' && (
                          <button
                            type="button"
                            onClick={() => setRubricTargetIdx(idx)}
                            title="Tiêu chí chấm điểm (Rubric)"
                            className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
                              q.rubrics && q.rubrics.length > 0
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                            }`}
                          >
                            <Award className="w-3.5 h-3.5 text-amber-600" />
                            <span>{q.rubrics && q.rubrics.length > 0 ? `Rubric (${q.rubrics.length})` : 'Rubric'}</span>
                          </button>
                        )}

                        {/* Save to question bank */}
                        <button
                          type="button"
                          onClick={() => handleSaveQuestionToBank(q)}
                          title="Lưu câu hỏi này vào ngân hàng câu hỏi dùng chung"
                          className="w-7 h-7 rounded-lg hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 flex items-center justify-center cursor-pointer"
                        >
                          <Database className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDuplicateQuestion(idx)}
                          className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(idx)}
                          className="w-7 h-7 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Question Content & Insertion Tools */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-slate-600">
                          Nội dung câu hỏi
                        </label>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setTableTargetIdx(idx)}
                            className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-bold rounded-lg cursor-pointer"
                          >
                            <TableIcon className="w-3 h-3 text-blue-600" />
                            <span>Bảng</span>
                          </button>
                        </div>
                      </div>

                      <textarea
                        rows={3}
                        value={q.question}
                        onChange={(e) => {
                          const val = e.target.value;
                          setQuestions((prev) => {
                            const next = [...prev];
                            next[idx] = { ...next[idx], question: val };
                            return next;
                          });
                        }}
                        placeholder="Nội dung câu hỏi, công thức KaTeX ($...$)..."
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Media attachments */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
                      {/* Image */}
                      <div>
                        <input
                          type="text"
                          value={q.imageUrl || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setQuestions((prev) => {
                              const next = [...prev];
                              next[idx] = { ...next[idx], imageUrl: val };
                              return next;
                            });
                          }}
                          placeholder="Link ảnh (https://...)"
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-800"
                        />
                      </div>

                      {/* Audio + Limit */}
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={q.audioUrl || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setQuestions((prev) => {
                              const next = [...prev];
                              next[idx] = { ...next[idx], audioUrl: val };
                              return next;
                            });
                          }}
                          placeholder="Link âm thanh (.mp3)"
                          className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-800"
                        />
                        <input
                          type="number"
                          min={0}
                          max={10}
                          value={q.maxAudioPlays ?? 0}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            setQuestions((prev) => {
                              const next = [...prev];
                              next[idx] = { ...next[idx], maxAudioPlays: val };
                              return next;
                            });
                          }}
                          title="Số lần nghe tối đa (0 = Không giới hạn)"
                          placeholder="Lần"
                          className="w-12 px-1 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-bold text-center"
                        />
                      </div>

                      {/* Video */}
                      <div>
                        <input
                          type="text"
                          value={q.videoUrl || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setQuestions((prev) => {
                              const next = [...prev];
                              next[idx] = { ...next[idx], videoUrl: val };
                              return next;
                            });
                          }}
                          placeholder="Link video (YouTube/MP4)"
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-800"
                        />
                      </div>
                    </div>

                    {/* Question Options / Details based on type */}
                    {q.type === 'multiple' && (
                      <div className="space-y-2 pt-1">
                        <span className="text-[11px] font-bold text-slate-500 block">
                          Các phương án lựa chọn (Click radio để chọn đáp án đúng):
                        </span>
                        {(q.options || ['', '', '', '']).map((opt, oIdx) => {
                          const letter = ['A', 'B', 'C', 'D'][oIdx] || `${oIdx + 1}`;
                          return (
                            <div key={oIdx} className="flex items-center gap-2">
                              <input
                                type="radio"
                                name={`correct_${idx}`}
                                checked={q.correct === oIdx}
                                onChange={() => {
                                  setQuestions((prev) => {
                                    const next = [...prev];
                                    next[idx] = { ...next[idx], correct: oIdx };
                                    return next;
                                  });
                                }}
                                className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                              />
                              <span className="w-5 font-black text-xs text-slate-600">
                                {letter}.
                              </span>
                              <input
                                type="text"
                                value={opt}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setQuestions((prev) => {
                                    const next = [...prev];
                                    const curOpts = [...((next[idx] as any).options || [])];
                                    curOpts[oIdx] = val;
                                    next[idx] = { ...next[idx], options: curOpts };
                                    return next;
                                  });
                                }}
                                placeholder={`Nội dung lựa chọn ${letter}...`}
                                className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {q.type === 'truefalse' && (
                      <div className="space-y-2 pt-1">
                        <span className="text-[11px] font-bold text-slate-500 block">
                          4 mệnh đề con a, b, c, d (Bật/tắt Đúng - Sai):
                        </span>
                        {(q.options || ['', '', '', '']).map((stmt, sIdx) => {
                          const letter = ['a', 'b', 'c', 'd'][sIdx] || `${sIdx + 1}`;
                          const isTrue = (q as any).correctAnswers?.[sIdx] === true;
                          return (
                            <div key={sIdx} className="flex items-center gap-2">
                              <span className="w-5 font-extrabold text-xs text-indigo-600 uppercase">
                                {letter})
                              </span>
                              <input
                                type="text"
                                value={stmt}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setQuestions((prev) => {
                                    const next = [...prev];
                                    const curOpts = [...((next[idx] as any).options || [])];
                                    curOpts[sIdx] = val;
                                    next[idx] = { ...next[idx], options: curOpts };
                                    return next;
                                  });
                                }}
                                placeholder={`Nội dung mệnh đề ${letter}...`}
                                className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setQuestions((prev) => {
                                    const next = [...prev];
                                    const curAnswers = [
                                      ...((next[idx] as any).correctAnswers || [
                                        true,
                                        false,
                                        false,
                                        false,
                                      ]),
                                    ];
                                    curAnswers[sIdx] = !curAnswers[sIdx];
                                    next[idx] = { ...next[idx], correctAnswers: curAnswers };
                                    return next;
                                  });
                                }}
                                className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                                  isTrue
                                    ? 'bg-emerald-600 text-white shadow-sm'
                                    : 'bg-rose-600 text-white shadow-sm'
                                }`}
                              >
                                {isTrue ? 'Đúng' : 'Sai'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {q.type === 'short' && (
                      <div className="pt-1 flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-600">
                          Đáp án chuẩn (số thập phân):
                        </span>
                        <input
                          type="text"
                          value={(q as any).correct || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setQuestions((prev) => {
                              const next = [...prev];
                              next[idx] = { ...next[idx], correct: val };
                              return next;
                            });
                          }}
                          placeholder="VD: 3.14 hoặc 3,14"
                          className="w-36 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 text-center"
                        />
                      </div>
                    )}

                    {q.type === 'matching' && (
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-500">
                            Các cặp nối tương ứng (Cột A - Cột B):
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setQuestions((prev) => {
                                const next = [...prev];
                                const curPairs = [...((next[idx] as any).pairs || [])];
                                curPairs.push({
                                  id: `${curPairs.length + 1}`,
                                  left: `Khái niệm ${curPairs.length + 1}`,
                                  right: `Nội dung ${curPairs.length + 1}`,
                                });
                                next[idx] = { ...next[idx], pairs: curPairs } as any;
                                return next;
                              });
                            }}
                            className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                          >
                            + Thêm cặp nối
                          </button>
                        </div>

                        {((q as any).pairs || []).map((pair: any, pIdx: number) => (
                          <div key={pIdx} className="flex items-center gap-2">
                            <span className="w-5 font-extrabold text-xs text-amber-600">
                              {pIdx + 1}.
                            </span>
                            <input
                              type="text"
                              value={pair.left || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setQuestions((prev) => {
                                  const next = [...prev];
                                  const curPairs = [...((next[idx] as any).pairs || [])];
                                  curPairs[pIdx] = { ...curPairs[pIdx], left: val };
                                  next[idx] = { ...next[idx], pairs: curPairs } as any;
                                  return next;
                                });
                              }}
                              placeholder="Nội dung Cột A..."
                              className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                            />
                            <span className="text-slate-400 font-bold">⇄</span>
                            <input
                              type="text"
                              value={pair.right || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setQuestions((prev) => {
                                  const next = [...prev];
                                  const curPairs = [...((next[idx] as any).pairs || [])];
                                  curPairs[pIdx] = { ...curPairs[pIdx], right: val };
                                  next[idx] = { ...next[idx], pairs: curPairs } as any;
                                  return next;
                                });
                              }}
                              placeholder="Nội dung Cột B tương ứng..."
                              className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setQuestions((prev) => {
                                  const next = [...prev];
                                  const curPairs = ((next[idx] as any).pairs || []).filter(
                                    (_: any, i: number) => i !== pIdx
                                  );
                                  next[idx] = { ...next[idx], pairs: curPairs } as any;
                                  return next;
                                });
                              }}
                              className="w-7 h-7 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {q.type === 'cloze' && (
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-500">
                            Danh sách vị trí điền khuyết (dùng [1], [2] trong đề bài):
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setQuestions((prev) => {
                                const next = [...prev];
                                const curBlanks = [...((next[idx] as any).blanks || [])];
                                curBlanks.push({
                                  id: `${curBlanks.length + 1}`,
                                  options: [],
                                  correct: '',
                                });
                                next[idx] = { ...next[idx], blanks: curBlanks } as any;
                                return next;
                              });
                            }}
                            className="text-[11px] font-bold text-teal-600 hover:underline cursor-pointer"
                          >
                            + Thêm vị trí điền khuyết
                          </button>
                        </div>

                        {((q as any).blanks || []).map((blank: any, bIdx: number) => (
                          <div
                            key={bIdx}
                            className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-black text-teal-700">
                                Chỗ trống [{blank.id || bIdx + 1}]:
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setQuestions((prev) => {
                                    const next = [...prev];
                                    const curBlanks = ((next[idx] as any).blanks || []).filter(
                                      (_: any, i: number) => i !== bIdx
                                    );
                                    next[idx] = { ...next[idx], blanks: curBlanks } as any;
                                    return next;
                                  });
                                }}
                                className="w-6 h-6 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                                  Đáp án chuẩn đúng
                                </label>
                                <input
                                  type="text"
                                  value={blank.correct || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setQuestions((prev) => {
                                      const next = [...prev];
                                      const curBlanks = [...((next[idx] as any).blanks || [])];
                                      curBlanks[bIdx] = { ...curBlanks[bIdx], correct: val };
                                      next[idx] = { ...next[idx], blanks: curBlanks } as any;
                                      return next;
                                    });
                                  }}
                                  placeholder="Đáp án đúng..."
                                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                                  Danh sách lựa chọn gợi ý (phân cách bởi dấu phẩy, để trống nếu nhập tự do)
                                </label>
                                <input
                                  type="text"
                                  value={Array.isArray(blank.options) ? blank.options.join(', ') : ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    const opts = val
                                      .split(',')
                                      .map((s) => s.trim())
                                      .filter(Boolean);
                                    setQuestions((prev) => {
                                      const next = [...prev];
                                      const curBlanks = [...((next[idx] as any).blanks || [])];
                                      curBlanks[bIdx] = { ...curBlanks[bIdx], options: opts };
                                      next[idx] = { ...next[idx], blanks: curBlanks } as any;
                                      return next;
                                    });
                                  }}
                                  placeholder="VD: CO2, O2, H2O..."
                                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {q.type === 'ordering' && (
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-500">
                            Các bước cần sắp xếp (theo đúng thứ tự chuẩn từ trên xuống dưới):
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setQuestions((prev) => {
                                const next = [...prev];
                                const curItems = [...((next[idx] as any).items || [])];
                                curItems.push({
                                  id: `step_${curItems.length + 1}`,
                                  text: `Bước ${curItems.length + 1}`,
                                });
                                next[idx] = { ...next[idx], items: curItems } as any;
                                return next;
                              });
                            }}
                            className="text-[11px] font-bold text-cyan-600 hover:underline cursor-pointer"
                          >
                            + Thêm bước
                          </button>
                        </div>

                        {((q as any).items || []).map((item: any, iIdx: number) => (
                          <div key={iIdx} className="flex items-center gap-2">
                            <span className="w-6 font-extrabold text-xs text-cyan-700">
                              {iIdx + 1}.
                            </span>
                            <input
                              type="text"
                              value={item.text || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setQuestions((prev) => {
                                  const next = [...prev];
                                  const curItems = [...((next[idx] as any).items || [])];
                                  curItems[iIdx] = { ...curItems[iIdx], text: val };
                                  next[idx] = { ...next[idx], items: curItems } as any;
                                  return next;
                                });
                              }}
                              placeholder={`Nội dung bước ${iIdx + 1}...`}
                              className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                            />
                            <button
                              type="button"
                              disabled={iIdx === 0}
                              onClick={() => {
                                setQuestions((prev) => {
                                  const next = [...prev];
                                  const curItems = [...((next[idx] as any).items || [])];
                                  const temp = curItems[iIdx - 1];
                                  curItems[iIdx - 1] = curItems[iIdx];
                                  curItems[iIdx] = temp;
                                  next[idx] = { ...next[idx], items: curItems } as any;
                                  return next;
                                });
                              }}
                              className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center disabled:opacity-30 cursor-pointer"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={iIdx === ((q as any).items || []).length - 1}
                              onClick={() => {
                                setQuestions((prev) => {
                                  const next = [...prev];
                                  const curItems = [...((next[idx] as any).items || [])];
                                  const temp = curItems[iIdx + 1];
                                  curItems[iIdx + 1] = curItems[iIdx];
                                  curItems[iIdx] = temp;
                                  next[idx] = { ...next[idx], items: curItems } as any;
                                  return next;
                                });
                              }}
                              className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center disabled:opacity-30 cursor-pointer"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setQuestions((prev) => {
                                  const next = [...prev];
                                  const curItems = ((next[idx] as any).items || []).filter(
                                    (_: any, i: number) => i !== iIdx
                                  );
                                  next[idx] = { ...next[idx], items: curItems } as any;
                                  return next;
                                });
                              }}
                              className="w-7 h-7 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {q.type === 'essay' && (
                      <div className="pt-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="block text-[11px] font-bold text-slate-600">
                            Hướng dẫn chấm / Lời giải mẫu
                          </label>
                          <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={(q as any).allowAttachments ?? true}
                              onChange={(e) => {
                                const val = e.target.checked;
                                setQuestions((prev) => {
                                  const next = [...prev];
                                  next[idx] = { ...next[idx], allowAttachments: val } as any;
                                  return next;
                                });
                              }}
                              className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                            />
                            <span>Cho phép nộp ảnh bài viết tay</span>
                          </label>
                        </div>
                        <textarea
                          rows={2}
                          value={(q as any).correct || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setQuestions((prev) => {
                              const next = [...prev];
                              next[idx] = { ...next[idx], correct: val };
                              return next;
                            });
                          }}
                          placeholder="Hướng dẫn chấm chi tiết..."
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* RIGHT COLUMN: Live Interactive Exam Preview */}
        <div className="sticky top-4">
          <div className="flex items-center justify-between pb-2 px-1">
            <span className="text-xs font-extrabold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-blue-600" />
              <span>Xem trực quan thời gian thực</span>
            </span>
            <span className="text-[10px] text-slate-400 font-bold">
              Hiển thị đúng như học sinh nhìn thấy khi làm bài
            </span>
          </div>

          <div className="max-h-[82vh] overflow-y-auto p-1 custom-scrollbar">
            <ExamLivePreview
              title={pubTitle}
              grade={pubClass}
              subject={pubSubject}
              examType={examType}
              author={metaAuthor}
              matrixDuration={matrixDuration}
              fullDuration={fullDuration}
              structure={structure}
              passages={passages}
              questions={questions}
            />
          </div>
        </div>
      </div>

      {/* Table Generator Modal */}
      <TableModal
        isOpen={tableTargetIdx !== null}
        onClose={() => setTableTargetIdx(null)}
        onInsertTable={handleInsertTableInQuestion}
      />

      {/* Shared Passage Manager Modal */}
      <PassageManagerModal
        isOpen={isPassageModalOpen}
        onClose={() => setIsPassageModalOpen(false)}
        passages={passages}
        questions={questions}
        onSavePassages={(newPassages, updatedQuestions) => {
          setPassages(newPassages);
          if (updatedQuestions) setQuestions(updatedQuestions);
          onToast(`Đã lưu ${newPassages.length} ngữ liệu chung thành công.`);
        }}
      />

      {/* Export / Print PDF Modal */}
      <ExportPdfModal
        isOpen={isExportPdfOpen}
        onClose={() => setIsExportPdfOpen(false)}
        title={pubTitle}
        grade={pubClass}
        subject={pubSubject}
        examType={examType}
        duration={matrixDuration || 45}
        schoolName={metaSchool || 'SỞ GIÁO DỤC VÀ ĐÀO TẠO'}
        passages={passages}
        questions={questions}
      />

      {/* Question Bank Modal */}
      <QuestionBankModal
        isOpen={isQuestionBankOpen}
        onClose={() => setIsQuestionBankOpen(false)}
        currentSubject={pubSubject}
        currentGrade={pubClass}
        onAddQuestionToExam={(q) => {
          setQuestions((prev) => [...prev, q]);
          onToast('Đã thêm 1 câu hỏi từ ngân hàng vào đề thi!');
        }}
        onToast={onToast}
      />

      {/* Exam Analytics / Bell Curve Modal */}
      <ExamAnalyticsModal
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        examTitle={pubTitle}
        questions={questions}
      />

      {/* Essay Rubric Modal */}
      {rubricTargetIdx !== null && (
        <RubricModal
          isOpen={true}
          onClose={() => setRubricTargetIdx(null)}
          questionNumber={rubricTargetIdx + 1}
          questionPoints={Number(questions[rubricTargetIdx]?.points || structPoints.essay || 2.0)}
          rubrics={questions[rubricTargetIdx]?.rubrics}
          onSaveRubrics={(newRubrics) => {
            setQuestions((prev) => {
              const next = [...prev];
              next[rubricTargetIdx] = {
                ...next[rubricTargetIdx],
                rubrics: newRubrics,
              };
              return next;
            });
            onToast('Đã cập nhật tiêu chí chấm Rubric cho câu hỏi!');
          }}
        />
      )}
    </div>
  );
};
