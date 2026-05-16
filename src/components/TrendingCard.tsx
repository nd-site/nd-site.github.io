import { Rocket } from 'lucide-react';
import { motion } from 'motion/react';

export default function TrendingCard() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h2 className="text-xl font-bold text-slate-800 mb-6">Trending Now</h2>
      
      <motion.div 
        whileHover={{ scale: 1.01 }}
        className="relative h-[280px] rounded-[2rem] overflow-hidden group cursor-pointer"
      >
        {/* Background Image / Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
          <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        </div>

        <div className="absolute inset-0 p-10 flex flex-col md:flex-row items-center gap-10">
          <div className="w-48 h-48 bg-white/10 backdrop-blur-xl rounded-[2rem] border border-white/20 p-6 flex items-center justify-center animate-float">
             <div className="relative">
                <Rocket size={80} className="text-white drop-shadow-lg" />
                <div className="absolute -top-2 -right-2 w-12 h-12 bg-rose-500 rounded-full flex items-center justify-center text-xs font-bold text-white border-4 border-indigo-600">
                  HOT
                </div>
             </div>
          </div>

          <div className="flex-1 text-white">
            <span className="inline-block bg-rose-500 text-[10px] font-black px-2 py-0.5 rounded-md mb-4 uppercase tracking-wider">HOT</span>
            <h3 className="text-4xl font-display font-bold mb-4">Khám phá: Khoa học dữ liệu cơ bản</h3>
            <p className="text-blue-100 text-sm max-w-lg leading-relaxed mb-8 opacity-80">
              Khám phá Khoa học dữ liệu cơ bản. Khám phá cách vẽ trang học trình nhiệm... Bạn sẽ hoàn toàn nắm vững mọi kiến thức của môn học này.
            </p>
            <button className="bg-white text-blue-600 px-8 py-3 rounded-full font-bold text-sm shadow-xl shadow-blue-900/20 hover:bg-blue-50 transition-colors">
              HỌC NGAY
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
