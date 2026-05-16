import { BookOpen, Calculator, FileText, Bot, Mic, GraduationCap, LayoutPanelLeft, Database, FlaskConical } from 'lucide-react';
import { motion } from 'motion/react';

const lessons = [
  { id: 1, title: 'Học bài viết Tiếng Anh 10 - Học kỳ II năm 2025-2026', grade: 'Lớp 10', color: 'bg-red-500', icon: BookOpen },
  { id: 2, title: 'Ôn tập Toán 9 - Học kỳ II năm 2024-2025', grade: 'Lớp 9', color: 'bg-red-500', icon: LayoutPanelLeft },
  { id: 3, title: 'Văn mẫu Lớp 8 - Ôn tập Tiếng Anh...', grade: 'Lớp 8', color: 'bg-red-500', icon: FileText },
];

const tools = [
  { id: 4, title: 'EduAI Assistant cường de...', grade: 'Lớp 10', color: 'bg-emerald-500', icon: Bot },
  { id: 5, title: 'Luyện nói tiếng Anh - Năm học 2025-2026', grade: 'Lớp 12', color: 'bg-emerald-500', icon: Mic },
  { id: 6, title: 'Trợ lý học tập - Học kỳ II năm 2025-2026', grade: 'Lớp 11', color: 'bg-emerald-500', icon: GraduationCap },
];

const tests = [
  { id: 7, title: 'Đề cương Lịch Sử 10 - Học kỳ II năm 2025-2026', grade: 'Lớp 10', color: 'bg-blue-600', icon: FileText },
  { id: 8, title: 'Kiểm tra Lý 10 - Học kỳ II năm 2025-2026', grade: 'Lớp 10', color: 'bg-blue-600', icon: Database },
  { id: 9, title: 'Bài tập Hóa 10 - Học kỳ II năm 2025-2026', grade: 'Lớp 10', color: 'bg-blue-600', icon: FlaskConical },
];

function Section({ title, items }: { title: string, items: any[] }) {
  return (
    <div className="flex flex-col gap-6">
      <h3 className="text-xl font-bold text-slate-800">{title}</h3>
      <div className="grid grid-cols-1 gap-4">
        {items.map((item) => (
          <motion.div 
            key={item.id}
            whileHover={{ y: -5 }}
            className={`p-6 rounded-[2rem] ${item.color} text-white flex flex-col justify-between h-[200px] shadow-lg shadow-black/5 group cursor-pointer relative overflow-hidden`}
          >
            <div className="absolute top-4 right-4 w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
              <item.icon size={20} />
            </div>
            
            <div className="mt-8">
              <p className="text-sm font-medium leading-relaxed group-hover:underline">
                {item.title}
              </p>
            </div>
            
            <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">{item.grade}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function SectionGrid() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-10">
      <Section title="Lessons" items={lessons} />
      <Section title="Tools" items={tools} />
      <Section title="Tests" items={tests} />
    </div>
  );
}
