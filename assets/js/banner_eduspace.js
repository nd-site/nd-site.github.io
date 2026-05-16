/**
 * EduSpace Announcement System
 * Manage multiple banners with 5s auto-slide, interactive dragging (like hot section),
 * and touch support.
 */

const announcements = [
    {
        title: "Scan2Word – Chuyển ảnh & tài liệu thành văn bản cực nhanh ✨",
        description: "Khám phá ngay công cụ hỗ trợ học tập mới nhất trong hệ sinh thái EduSpace.",
        link: "https://web.facebook.com/share/p/1GvdRNu49r/",
        buttonText: "Xem bài viết",
        tag: "Mới cập nhật",
        platform: "Facebook",
        gradient: "from-blue-600 via-indigo-600 to-violet-600"
    },
    {
        title: "Hệ thống luyện thi THPT Quốc Gia 2026 chính thức ra mắt",
        description: "Lộ trình ôn tập toàn diện với cấu trúc đề mới nhất từ Bộ Giáo dục.",
        link: "/eduspace/thptqg/2026/index.html",
        buttonText: "Khám phá ngay",
        tag: "Hot News",
        platform: "EduSpace",
        gradient: "from-orange-600 via-rose-500 to-amber-500"
    }
];

class AnnouncementCarousel {
    constructor(containerId, data) {
        this.containerId = containerId;
        this.data = data;
        this.currentIndex = 0;
        this.interval = null;
        
        // Dragging state
        this.isDragging = false;
        this.startX = 0;
        this.currentTranslate = 0;
        this.prevTranslate = 0;
        this.animationID = 0;
        
        this.init();
    }

    init() {
        let container = document.getElementById(this.containerId);
        if (!container) {
            container = document.createElement('div');
            container.id = this.containerId;
            
            const target = document.querySelector('#start-screen .glass-card') || document.querySelector('#start-screen') || document.body.firstChild;
            if (target && target.id === 'start-screen') {
                target.prepend(container);
            } else if (target) {
                target.parentNode.insertBefore(container, target);
            }
        }
        
        container.className = "w-full max-w-4xl mx-auto mb-8 overflow-hidden relative touch-pan-y select-none";
        
        this.renderStructure();
        this.startAutoSlide();
        this.setupEvents();
    }

    renderStructure() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        const track = document.createElement('div');
        track.id = `${this.containerId}-track`;
        track.className = "flex w-full cursor-grab active:cursor-grabbing will-change-transform";

        this.data.forEach((item) => {
            const slide = document.createElement('div');
            slide.className = "w-full flex-shrink-0 px-4 md:px-0"; 
            
            slide.innerHTML = `
                <a href="${item.link}" target="_blank" draggable="false"
                   class="relative flex flex-col md:flex-row items-center justify-between p-1 bg-gradient-to-r ${item.gradient} rounded-[1.5rem] shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden">
                    
                    <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
                    <div class="absolute -right-10 -top-10 w-40 h-40 bg-white/20 rounded-full blur-3xl group-hover:bg-white/30 transition-all duration-700 pointer-events-none"></div>
                    
                    <div class="flex flex-col md:flex-row items-center gap-4 p-4 relative z-10 w-full pointer-events-none">
                        <div class="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500">
                            <i data-lucide="sparkles" class="w-8 h-8 text-white"></i>
                        </div>
                        
                        <div class="text-center md:text-left">
                            <div class="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1">
                                <span class="px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-lg text-[10px] font-black uppercase tracking-widest text-white">${item.tag}</span>
                                <span class="flex items-center gap-1 text-[10px] font-bold text-blue-100">
                                    <i data-lucide="info" class="w-3 h-3"></i> ${item.platform}
                                </span>
                            </div>
                            <h3 class="text-base md:text-lg font-bold text-white leading-tight">
                                ${item.title}
                            </h3>
                            <p class="text-xs text-blue-100/80 font-medium">
                                ${item.description}
                            </p>
                        </div>
                    </div>

                    <div class="p-4 w-full md:w-auto relative z-10 pointer-events-none">
                        <div class="flex items-center justify-center gap-2 bg-white text-blue-600 px-6 py-2.5 rounded-xl font-bold text-xs shadow-lg group-hover:bg-blue-50 group-hover:translate-x-1 transition-all">
                            ${item.buttonText}
                            <i data-lucide="chevron-right" class="w-4 h-4"></i>
                        </div>
                    </div>
                </a>
            `;
            track.appendChild(slide);
        });

        const dotsContainer = document.createElement('div');
        dotsContainer.id = `${this.containerId}-dots`;
        dotsContainer.className = "flex justify-center gap-1.5 mt-3";
        
        container.innerHTML = '';
        container.appendChild(track);
        container.appendChild(dotsContainer);

        this.updateDots();
        if (window.lucide) window.lucide.createIcons();
        
        this.track = track;
    }

    setupEvents() {
        // Touch events
        this.track.addEventListener('touchstart', this.touchStart.bind(this));
        this.track.addEventListener('touchend', this.touchEnd.bind(this));
        this.track.addEventListener('touchmove', this.touchMove.bind(this));

        // Mouse events
        this.track.addEventListener('mousedown', this.touchStart.bind(this));
        this.track.addEventListener('mouseup', this.touchEnd.bind(this));
        this.track.addEventListener('mouseleave', this.touchEnd.bind(this));
        this.track.addEventListener('mousemove', this.touchMove.bind(this));

        // Prevent context menu
        this.track.addEventListener('contextmenu', e => e.preventDefault());
    }

    touchStart(event) {
        this.isDragging = true;
        this.startX = this.getPositionX(event);
        this.stopAutoSlide();
        
        this.track.classList.remove('transition-transform');
        this.track.style.transitionDuration = '0ms';
        
        this.animationID = requestAnimationFrame(this.animation.bind(this));
    }

    touchEnd() {
        this.isDragging = false;
        cancelAnimationFrame(this.animationID);

        const movedBy = this.currentTranslate - this.prevTranslate;

        if (movedBy < -100 && this.currentIndex < this.data.length - 1) this.currentIndex += 1;
        if (movedBy > 100 && this.currentIndex > 0) this.currentIndex -= 1;

        this.setPositionByIndex();
        this.startAutoSlide();
    }

    touchMove(event) {
        if (this.isDragging) {
            const currentPosition = this.getPositionX(event);
            this.currentTranslate = this.prevTranslate + currentPosition - this.startX;
        }
    }

    getPositionX(event) {
        return event.type.includes('mouse') ? event.clientX : event.touches[0].clientX;
    }

    animation() {
        this.setSliderPosition();
        if (this.isDragging) requestAnimationFrame(this.animation.bind(this));
    }

    setSliderPosition() {
        this.track.style.transform = `translateX(${this.currentTranslate}px)`;
    }

    setPositionByIndex() {
        const width = this.track.offsetWidth;
        this.currentTranslate = this.currentIndex * -width;
        this.prevTranslate = this.currentTranslate;
        
        this.track.style.transition = 'transform 0.5s ease-in-out';
        this.setSliderPosition();
        this.updateDots();
    }

    updateDots() {
        const dotsContainer = document.getElementById(`${this.containerId}-dots`);
        if (!dotsContainer) return;

        dotsContainer.innerHTML = this.data.map((_, i) => `
            <button onclick="window.eduAnnouncement.goTo(${i})" 
                    class="w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === this.currentIndex ? 'bg-blue-600 w-4' : 'bg-slate-300'}">
            </button>
        `).join('');
    }

    startAutoSlide() {
        if (this.data.length <= 1) return;
        this.stopAutoSlide();
        this.interval = setInterval(() => {
            this.next();
        }, 5000);
    }

    stopAutoSlide() {
        if (this.interval) clearInterval(this.interval);
    }

    next() {
        if (this.currentIndex < this.data.length - 1) {
            this.currentIndex += 1;
        } else {
            this.currentIndex = 0;
        }
        this.setPositionByIndex();
    }

    goTo(index) {
        this.currentIndex = index;
        this.setPositionByIndex();
        this.startAutoSlide();
    }
}

// Global initialization
window.addEventListener('load', () => {
    window.eduAnnouncement = new AnnouncementCarousel('edu-announcement-container', announcements);
});
