import { X, Send, Paperclip, Mic, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: 'Em cách mữ khọc mắn problem ở nà thình vì các hiệp quan nửu và tro math phán punì thêng giử, solve a quadratic equation là e.g..',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Quadratic_formula.svg/1200px-Quadratic_formula.svg.png'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (messageText?: string) => {
    const text = messageText || input;
    if (!text.trim()) return;

    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setInput('');
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: text,
        config: {
          systemInstruction: "Bạn là một trợ lý giáo dục tên EduAI. Bạn giúp học sinh giải đáp các bài tập toán, lý, hóa, văn, tiếng anh. Hãy trả lời ngắn gọn, thân thiện và chính xác bằng tiếng Việt. Nếu có thể, hãy giải thích từng bước."
        }
      });

      setMessages(prev => [...prev, { role: 'assistant', content: response.text || 'Xin lỗi, mình không thể trả lời lúc này.' }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Có lỗi xảy ra khi kết nối với AI.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 bg-blue-600 text-white px-6 py-4 rounded-full shadow-2xl shadow-blue-600/40 font-bold flex items-center gap-3 hover:scale-105 active:scale-95 transition-all z-40"
      >
        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-xs">AID</span>
        </div>
        EduAI Assistant
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, x: 100, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.95 }}
            className="fixed inset-y-8 right-8 w-full max-w-[450px] glass-morphism rounded-[2.5rem] shadow-2xl z-50 flex flex-col border border-white/40 overflow-hidden"
          >
            {/* Header */}
            <div className="p-8 flex items-center justify-between border-b border-white/20">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <span className="text-white font-bold text-sm">AID</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">EduAI Assistant</h3>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                    <span className="text-xs font-medium text-slate-400">Online</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 text-slate-400 hover:bg-white/50 rounded-xl transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-3xl rounded-tr-none py-3 px-5' : 'bg-white rounded-3xl rounded-tl-none p-5 card-shadow border border-slate-100 text-slate-700'}`}>
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                    {msg.image && (
                      <div className="mt-4 rounded-xl overflow-hidden bg-slate-50 border border-slate-100">
                        <img src={msg.image} alt="Math illustration" className="w-full h-auto" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white rounded-3xl rounded-tl-none p-4 card-shadow border border-slate-100 flex gap-1 items-center">
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-8 py-6 space-y-6">
              <div className="space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Smart suggestions</p>
                <div className="flex flex-wrap gap-2">
                  {['Giải thích thêm', 'Cho ví dụ khác', 'Tóm tắt bài học'].map((tag) => (
                    <button 
                      key={tag}
                      onClick={() => handleSend(tag)}
                      className="text-xs font-semibold px-4 py-2 bg-white/50 border border-slate-200 rounded-full hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Tìm kiếm tên bài tập, chủ đề..."
                  className="w-full pl-6 pr-14 py-4 rounded-2xl bg-white border-none shadow-lg shadow-blue-500/5 focus:ring-2 focus:ring-blue-500/10 transition-all outline-none text-slate-600 text-sm"
                />
                <button 
                  onClick={() => handleSend()}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/20 hover:scale-105 transition-all"
                >
                  <Send size={18} />
                </button>
              </div>

              <div className="flex items-center justify-between pb-2">
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition-all">
                    <Paperclip size={14} /> Attach file
                  </button>
                  <button className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition-all">
                    <Mic size={14} /> Voice input
                  </button>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-100/50 px-2 py-0.5 rounded-md">
                   POWERED BY <Sparkles size={10} className="text-amber-400" /> GEMINI
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
