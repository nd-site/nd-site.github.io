import { Users, ChevronRight } from 'lucide-react';

const grades = [
  { id: 1, label: 'Lớp 9', progress: 30 },
  { id: 2, label: 'Lớp 10', progress: 75 },
  { id: 3, label: 'Lớp 11', progress: 45 },
  { id: 4, label: 'Lớp 12', progress: 10 },
];

export default function GradeExplorer() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h2 className="text-xl font-bold text-slate-800 mb-8">Explore by Grade</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {grades.map((grade) => (
          <div key={grade.id} className="bg-white p-6 rounded-[2.5rem] card-shadow border border-slate-100 group hover:border-blue-200 transition-all cursor-pointer">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                <Users size={24} />
              </div>
              <span className="font-bold text-slate-800 text-lg">{grade.label}</span>
            </div>
            
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                style={{ width: `${grade.progress}%` }}
              ></div>
            </div>
          </div>
        ))}
        
        <button className="absolute right-12 mt-12 w-10 h-10 bg-white rounded-full card-shadow border border-slate-100 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all">
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
