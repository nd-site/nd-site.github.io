import React, { useState, useEffect, useCallback } from 'react';
import { Menu, X, BookOpen, LogIn, LogOut, User as UserIcon, Heart, PlusCircle, Trash2, Shield, Settings, Mail, Lock } from 'lucide-react';
// Imports cho Firebase
import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    signInAnonymously, 
    signInWithCustomToken, 
    onAuthStateChanged, 
    signOut,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from 'firebase/auth';
import { 
    getFirestore, 
    collection, 
    doc, 
    setDoc, 
    deleteDoc, 
    onSnapshot, 
    query,       
    where,       
    getDocs,     
    getDoc,
    setLogLevel       
} from 'firebase/firestore'; 

// --- CẤU HÌNH ADMIN TẠO SẴN ---
const ADMIN_USERNAME = 'admin';

// BẬT LOG DEBUG CHO FIRESTORE
setLogLevel('debug');


// --- COMMON COMPONENTS (CODE CHUNG) ---

/**
 * Component: Logo và Tiêu đề
 */
const Logo = () => (
  <div className="flex items-center space-x-2">
    {/* Icon Sách */}
    <BookOpen className="h-8 w-8 text-blue-600" />
    <span className="text-2xl font-extrabold text-gray-800">EduSpace</span>
    <span className="hidden sm:inline text-sm text-gray-500 font-medium">- ND Labs</span>
  </div>
);

/**
 * Component: Thanh Điều Hướng (Dùng chung cho Desktop)
 */
const DesktopNav = ({ isAdmin }) => (
  <nav className="hidden md:flex space-x-8 items-center">
    <NavItem href="#home">Trang Chủ</NavItem>
    <NavItem href="#courses">Khóa Học</NavItem>
    <NavItem href="#personal">Của Tôi</NavItem>
    {/* CHỈ HIỂN THỊ CHO ADMIN */}
    {isAdmin && <NavItem href="#admin" className="text-red-600 hover:text-red-700 font-bold"><Shield className="inline h-4 w-4 mr-1"/> Quản Trị</NavItem>}
    <NavItem href="#contact">Liên Hệ</NavItem>
  </nav>
);

/**
 * Component: Item trong Navigation
 */
const NavItem = ({ href, children, className = '' }) => (
  <a 
    href={href} 
    className={`flex items-center text-gray-700 hover:text-blue-600 transition duration-150 font-medium p-2 rounded-lg hover:bg-blue-50 ${className}`}
  >
    {children}
  </a>
);

/**
 * Component: Avatar và Khu vực Tài khoản
 * SỬ DỤNG username để hiển thị
 */
const AccountArea = ({ username, userId, userRole, onSignOut, onSignInClick }) => {
    // Sử dụng username (hoặc email) để hiển thị
    const displayId = username || userId;

    if (displayId) {
        const roleColor = userRole === 'admin' ? 'bg-red-200 text-red-800' : 'bg-blue-100 text-blue-800';
        const roleIcon = userRole === 'admin' ? <Shield className="h-4 w-4 mr-1 fill-current" /> : null;

        return (
            <div className={`flex flex-col sm:flex-row items-center space-x-0 sm:space-x-3 p-2 rounded-xl ${roleColor} shadow-inner group transition duration-150`}>
                <div className="flex items-center space-x-2">
                    <UserIcon className="h-5 w-5" />
                    <span className="text-sm font-semibold truncate max-w-[120px] sm:max-w-full" title={displayId}>
                        {displayId}
                    </span>
                </div>
                <div className="flex items-center mt-1 sm:mt-0 space-x-2">
                    <span className="text-xs font-bold uppercase py-0.5 px-2 rounded-full bg-white bg-opacity-50 flex items-center">
                        {roleIcon}
                        {userRole || 'Loading...'}
                    </span>
                    <button 
                        onClick={onSignOut}
                        title="Đăng Xuất"
                        className="p-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition duration-150"
                    >
                        <LogOut className="h-4 w-4" />
                    </button>
                </div>
            </div>
        );
    }
    
    return (
        <button 
            onClick={onSignInClick} // Mở modal khi click
            className="flex items-center space-x-2 p-2 px-4 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition duration-150 shadow-md">
            <LogIn className="h-5 w-5" />
            <span className="font-semibold">Đăng Nhập</span>
        </button>
    );
};


/**
 * Component: Menu Mobile (Thanh bên trượt vào)
 */
const MobileMenu = ({ isMenuOpen, onClose, username, userId, userRole, onSignOut, onSignInClick }) => { 
  const menuClass = isMenuOpen 
    ? "transform translate-x-0" 
    : "transform translate-x-full";
  const isAdmin = userRole === 'admin';
  const displayId = username || userId; // Sử dụng username để hiển thị

  const handleLinkClick = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleSignInClick = () => {
      onClose();
      onSignInClick();
  }

  return (
    <div 
      id="mobile-menu" 
      className={`fixed top-0 right-0 w-64 h-full bg-white shadow-2xl z-[60] transition-transform duration-300 md:hidden ${menuClass}`}
      role="dialog"
      aria-modal="true"
      aria-hidden={!isMenuOpen}
    >
      <div className="p-4 flex flex-col space-y-4">
        {/* Nút Đóng Menu */}
        <button 
          onClick={onClose} 
          className="self-end p-2 text-gray-500 hover:text-red-500 transition duration-150" 
          aria-label="Đóng menu"
        >
        <X className="h-6 w-6" />
        </button>
        
        {/* Hiển thị User ID và Role trong Mobile Menu */}
        {displayId && (
            <div className={`flex flex-col items-start p-3 rounded-lg shadow-inner ${isAdmin ? 'bg-red-50' : 'bg-blue-50'}`}>
                <span className="text-xs text-gray-600">ID Người Dùng:</span>
                <span className="text-sm font-semibold text-blue-800 truncate w-full" title={displayId}>{displayId}</span>
                <span className="text-xs text-gray-600 mt-1">UID: <span className="font-mono text-xs">{userId}</span></span>
                <span className={`text-xs font-bold mt-2 uppercase py-0.5 px-2 rounded-full ${isAdmin ? 'bg-red-400 text-white' : 'bg-blue-200 text-blue-800'}`}>
                    {userRole || 'Loading...'}
                </span>
            </div>
        )}
        
        {/* Các liên kết trong Menu Mobile */}
        <NavItemMobile href="#home" onClick={handleLinkClick}>Trang Chủ</NavItemMobile>
        <NavItemMobile href="#courses" onClick={handleLinkClick}>Khóa Học</NavItemMobile>
        <NavItemMobile href="#personal" onClick={handleLinkClick}>Của Tôi</NavItemMobile>
        {/* CHỈ HIỂN THỊ CHO ADMIN */}
        {isAdmin && (
            <NavItemMobile href="#admin" onClick={handleLinkClick} className="text-red-600 font-bold">
                <Shield className="inline h-5 w-5 mr-2"/> Quản Trị Hệ Thống
            </NavItemMobile>
        )}
        <NavItemMobile href="#contact" onClick={handleLinkClick}>Liên Hệ</NavItemMobile>

        {/* Nút Đăng nhập/Đăng ký / Đăng xuất */}
        {displayId ? (
            <button 
                onClick={onSignOut}
                className="w-full mt-4 py-2 px-4 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition duration-150 shadow-md"
            >
                Đăng Xuất
            </button>
        ) : (
            <button 
                onClick={handleSignInClick}
                className="w-full mt-4 py-2 px-4 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition duration-150 shadow-md"
            >
                Đăng Nhập
            </button>
        )}
      </div>
    </div>
  );
};

/**
 * Component: Item trong Mobile Navigation
 */
const NavItemMobile = ({ href, children, onClick, className = '' }) => (
  <a 
    href={href} 
    onClick={onClick}
    className={`flex items-center p-3 rounded-lg text-gray-700 hover:bg-blue-100 font-semibold transition duration-150 ${className}`}
  >
    {children}
  </a>
);

/**
 * Component: Header (Thanh Điều Hướng) - CODE CHUNG
 */
const Header = ({ onMenuToggle, username, userId, userRole, onSignOut, isAdmin, onSignInClick }) => (
  <header className="bg-white shadow-lg sticky top-0 z-50">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
      <Logo />
      <DesktopNav isAdmin={isAdmin} />
      
      <div className="flex items-center space-x-4">
        <AccountArea username={username} userId={userId} userRole={userRole} onSignOut={onSignOut} onSignInClick={onSignInClick} />
        
        {/* Dấu 3 Gạch (Mobile Menu Toggle) */}
        <button 
          onClick={onMenuToggle}
          className="md:hidden p-2 rounded-lg hover:bg-blue-100 text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150" 
          aria-label="Mở menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>
    </div>
  </header>
);

/**
 * Component: Footer - CODE CHUNG
 */
const Footer = () => (
  <footer className="bg-gray-800 text-white mt-12">
    <div className="container mx-auto px-4 py-8 text-center">
      <p>&copy; 2025 EduSpace. Bảo lưu mọi quyền. | <span className="text-blue-400">Chính sách Bảo mật</span></p>
    </div>
  </footer>
);


// --- AUTHENTICATION MODAL (MODAL XÁC THỰC) ---

/**
 * Component: Input field tùy chỉnh
 */
const FormInput = ({ icon: Icon, type = 'text', placeholder, value, onChange, id }) => (
    <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <Icon className="h-5 w-5" />
        </span>
        <input
            id={id}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            required
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 shadow-sm"
        />
    </div>
);


/**
 * Component: Modal Đăng nhập/Đăng ký
 */
const AuthModal = ({ isOpen, onClose, onSignIn, onSignUp }) => {
    const [isSignIn, setIsSignIn] = useState(true); // true: Sign In, false: Sign Up
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState(''); // THÊM: State cho Username
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Reset state khi modal đóng
    useEffect(() => {
        if (!isOpen) {
            setEmail('');
            setPassword('');
            setUsername('');
            setError(null);
            setLoading(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (isSignIn) {
                await onSignIn(email, password);
            } else {
                if (!username || username.length < 3) {
                    throw new Error("Tên ID (Username) phải có ít nhất 3 ký tự.");
                }
                await onSignUp(email, password, username); // TRUYỀN THÊM USERNAME
            }
        } catch (err) {
            // Xử lý lỗi Firebase và hiển thị
            let errorMessage = (err.message && err.message.startsWith('FirebaseError:')) 
                               ? err.message.replace('FirebaseError: Firebase: ', '').replace(/\(auth.*\)\.?/, '').trim()
                               : err.message;
            
            // Xử lý lỗi đặc biệt (ví dụ: auth/invalid-credential)
            if (errorMessage.includes('auth/invalid-credential')) {
                errorMessage = "Email hoặc mật khẩu không hợp lệ. Vui lòng kiểm tra lại.";
            }

            setError(errorMessage || "Đã xảy ra lỗi không xác định.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4 transition-opacity duration-300"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 md:p-8 transform transition-transform duration-300 scale-100"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6 border-b pb-3">
                    <h2 className="text-2xl font-bold text-gray-800">
                        {isSignIn ? "Đăng Nhập" : "Đăng Ký"}
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition duration-150">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {error && (
                    <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg border border-red-300">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* THÊM TRƯỜNG USERNAME CHO ĐĂNG KÝ */}
                    {!isSignIn && (
                        <FormInput 
                            id="username"
                            icon={UserIcon}
                            type="text"
                            placeholder="Tên ID / Username (Duy nhất)"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    )}
                    
                    <FormInput 
                        id="email"
                        icon={Mail}
                        type="email"
                        placeholder="Địa chỉ Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <FormInput 
                        id="password"
                        icon={Lock}
                        type="password"
                        placeholder="Mật khẩu"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 rounded-xl font-bold text-white transition duration-200 shadow-md ${
                            loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                    >
                        {loading ? 'Đang Xử Lý...' : (isSignIn ? 'Đăng Nhập Ngay' : 'Đăng Ký Tài Khoản')}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm">
                    <button 
                        onClick={() => { setIsSignIn(prev => !prev); setError(null); }}
                        className="text-blue-600 hover:text-blue-800 font-medium transition duration-150"
                    >
                        {isSignIn 
                            ? "Chưa có tài khoản? Đăng ký ngay." 
                            : "Đã có tài khoản? Đăng nhập."
                        }
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- MOCK DATA (Dữ liệu mẫu) ---
const MOCK_COURSES = [
    { id: 'web-dev', title: "Lập Trình Web Toàn Diện", description: "Học HTML, CSS, JavaScript và Framework hiện đại.", price: "599.000 VNĐ" },
    { id: 'english', title: "Tiếng Anh Giao Tiếp Cấp Tốc", description: "Cải thiện khả năng nói và nghe chỉ trong 30 ngày.", price: "350.000 VNĐ" },
    { id: 'design', title: "Thiết Kế Đồ Họa Cơ Bản", description: "Sử dụng Photoshop và Illustrator để tạo ra tác phẩm đầu tiên.", price: "Miễn Phí" },
];


// --- PAGE-SPECIFIC COMPONENTS (CODE RIÊNG CHO TRANG CHỦ) ---

/**
 * Component: Phần Giới Thiệu (Hero Section)
 */
const HeroSection = () => (
  <section id="gioi-thieu" className="bg-white p-6 md:p-12 rounded-2xl shadow-xl mb-12 border-t-4 border-blue-400">
    <div className="flex flex-col lg:flex-row items-center justify-between">
      {/* Văn bản Giới thiệu */}
      <div className="lg:w-1/2 mb-8 lg:mb-0">
        <span className="text-sm font-semibold text-blue-600 uppercase tracking-widest bg-blue-100 py-1 px-3 rounded-full shadow-md">Chào mừng đến với EduSpace</span>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mt-4 leading-tight">
          Nền Tảng Học Tập <span className="text-blue-600">Tuyệt Vời</span> Của Bạn
        </h1>
        <p className="mt-6 text-lg text-gray-600 leading-relaxed">
          EduSpace cung cấp hàng ngàn khóa học chất lượng cao từ các chuyên gia hàng đầu. Bắt đầu hành trình chinh phục kiến thức của bạn ngay hôm nay, mọi lúc mọi nơi, với giao diện thân thiện và dễ sử dụng.
        </p>
        <div className="mt-8 space-x-4">
          <a href="#courses" className="inline-block py-3 px-8 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition duration-300 transform hover:scale-105 shadow-lg">
            Khám Phá Khóa Học
          </a>
          <a href="#about" className="inline-block py-3 px-8 text-blue-600 font-semibold border-2 border-blue-300 rounded-xl hover:bg-blue-50 transition duration-300">
            Tìm Hiểu Thêm
          </a>
        </div>
      </div>

      {/* Hình ảnh Minh họa */}
      <div className="lg:w-5/12">
        <img 
          src="https://placehold.co/600x400/81c7f5/ffffff?text=Học+Tập+Trực+Tuyến" 
          alt="Minh họa học tập trực tuyến" 
          className="rounded-3xl shadow-2xl w-full h-auto transform transition duration-500 hover:rotate-1 hover:shadow-3xl"
          onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x400/81c7f5/ffffff?text=Học+Tập'; }}
        />
      </div>
    </div>
  </section>
);

/**
 * Component: Thẻ Khóa Học - Có thêm chức năng lưu vào danh sách yêu thích
 */
const CourseCard = ({ course, isFavorite, onToggleFavorite }) => {
    const handleToggle = () => {
        onToggleFavorite(course, isFavorite);
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition duration-300 border-b-4 border-blue-400 relative">
            <h3 className="text-xl font-bold text-gray-800 mb-2">{course.title}</h3>
            <p className="text-gray-500 mb-4 text-sm">{course.description}</p>
            <span className="text-lg font-bold text-blue-600">{course.price}</span>
            
            <div className="flex items-center justify-between mt-4">
                <button 
                    className="flex items-center space-x-2 py-2 px-4 rounded-lg text-blue-600 border border-blue-300 hover:bg-blue-50 transition duration-200"
                >
                    Xem Chi Tiết
                </button>
                
                <button 
                    onClick={handleToggle}
                    className={`p-2 rounded-full transition duration-300 ${
                        isFavorite 
                            ? 'bg-red-500 text-white hover:bg-red-600 shadow-md' 
                            : 'bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-500'
                    }`}
                    title={isFavorite ? "Xóa khỏi danh sách yêu thích" : "Thêm vào danh sách yêu thích"}
                >
                    <Heart className="h-5 w-5 fill-current" />
                </button>
            </div>
        </div>
    );
};

/**
 * Component: Khóa Học Nổi Bật (hiển thị danh sách Mock)
 */
const FeaturedCourses = ({ favorites, onToggleFavorite }) => {
    return (
        <section id="courses" className="py-10">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Khóa Học Nổi Bật</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {MOCK_COURSES.map(course => (
                    <CourseCard 
                        key={course.id}
                        course={course}
                        isFavorite={favorites.some(fav => fav.id === course.id)}
                        onToggleFavorite={onToggleFavorite}
                    />
                ))}
            </div>
        </section>
    );
};

/**
 * Component: Danh sách Khóa học Cá nhân (Personal Course List)
 */
const PersonalCourses = ({ favorites, onToggleFavorite }) => {
    const isReady = favorites !== null;

    return (
        <section id="personal" className="py-10 min-h-[400px]">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">
                <Heart className="inline-block mr-2 h-7 w-7 text-red-500 fill-current" />
                Khóa Học Yêu Thích Của Tôi
            </h2>

            {!isReady ? (
                <div className="text-center p-8 bg-blue-50 rounded-xl text-blue-700">Đang tải danh sách khóa học cá nhân...</div>
            ) : favorites.length === 0 ? (
                <div className="text-center p-12 bg-gray-100 rounded-xl shadow-inner border border-dashed border-gray-300">
                    <PlusCircle className="h-10 w-10 mx-auto text-gray-500 mb-4" />
                    <p className="text-xl font-semibold text-gray-700">Chưa có khóa học yêu thích nào.</p>
                    <p className="text-gray-500 mt-2">Hãy nhấn biểu tượng trái tim trên các Khóa học nổi bật để thêm vào danh sách!</p>
                    <a href="#courses" className="mt-4 inline-block text-blue-600 hover:text-blue-800 font-medium transition duration-200">
                        Quay lại Khóa Học Nổi Bật
                    </a>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {favorites.map(course => (
                        <div key={course.id} className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-red-400 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">{course.title}</h3>
                                <p className="text-sm text-gray-500">{course.price}</p>
                            </div>
                            <button 
                                onClick={() => onToggleFavorite(course, true)} // Gửi true để xác nhận xóa
                                className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition duration-150"
                                title="Xóa khỏi danh sách"
                            >
                                <Trash2 className="h-5 w-5" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
};

/**
 * Component: Bảng Quản Trị Admin (Chỉ dành cho Admin)
 */
const AdminPanel = ({ userRole, db, appId }) => {
    if (userRole !== 'admin') {
        return (
            <div className="p-12 text-center bg-red-50 rounded-xl shadow-lg">
                <Shield className="h-12 w-12 mx-auto text-red-500 mb-4"/>
                <p className="text-xl font-bold text-red-700">Truy cập bị từ chối.</p>
                <p className="text-red-500 mt-2">Bạn không có quyền quản trị để truy cập trang này.</p>
            </div>
        );
    }
    
    // Logic quản lý vai trò (tạm thời) - chỉ cho phép gán vai trò 'user' cho nhatdang
    const handleSetNhatDangRole = (role) => {
        if (!db) return;
        
        // Đây là ví dụ giả định ID của nhatdang (cần ID thực tế để gán)
        // Vì không có ID thực, tôi sẽ log ra hướng dẫn
        console.warn("Để gán vai trò cho nhatdang, bạn cần biết User ID thực tế của tài khoản đó.");
        // Lấy Admin UID từ localStorage
        const adminUid = localStorage.getItem('adminUid') || 'Chưa xác định';
        console.log(`Hướng dẫn: Bạn là Admin (UID: ${adminUid}). Để gán vai trò cho user khác, bạn cần ID của họ và cập nhật thủ công trong Firestore: /artifacts/${appId}/public/data/roles/{user_id}`);

        // Hiện tại, đây chỉ là UI mô phỏng
        const message = `Yêu cầu gán vai trò ${role} cho nhatdang đã được xử lý (Mock). Vui lòng kiểm tra console để biết hướng dẫn chỉnh sửa thủ công trong Firestore.`;
        console.log(message);
    };

    return (
        <section id="admin" className="py-10 min-h-[400px]">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">
                <Settings className="inline-block mr-2 h-7 w-7 text-gray-700"/>
                Bảng Điều Khiển Quản Trị
            </h2>
            
            <div className="bg-white p-8 rounded-xl shadow-2xl border-t-4 border-red-500 max-w-4xl mx-auto">
                <p className="text-lg font-semibold mb-4 text-red-700">Quyền truy cập tối cao đang hoạt động.</p>
                
                <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg border">
                        <h4 className="font-bold text-gray-800">Quản lý Vai trò Người dùng (Mock)</h4>
                        <p className="text-sm text-gray-500 mb-3">Tính năng mô phỏng việc gán vai trò cho người dùng khác.</p>
                        
                        <div className="flex flex-col sm:flex-row items-center justify-between p-3 bg-white rounded-lg shadow-inner">
                            <span className="font-medium">Tài khoản "nhatdang"</span>
                            <button 
                                onClick={() => handleSetNhatDangRole('user')}
                                className="mt-2 sm:mt-0 py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-150 shadow-md"
                            >
                                Gán Vai trò 'user'
                            </button>
                        </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg border">
                        <h4 className="font-bold text-gray-800">Thông tin Hệ thống</h4>
                        <p className="text-sm text-gray-700">App ID: <span className="font-mono bg-yellow-100 p-1 rounded text-xs">{appId}</span></p>
                        <p className="text-sm text-gray-700">Trạng thái Khóa học: **Miễn Phí** (Miễn phí hoàn toàn. Logic khóa học tốn tiền sẽ được thêm sau).</p>
                    </div>
                </div>
            </div>
        </section>
    );
};


// --- MAIN APPLICATION (CHỨA CẢ CHUNG VÀ RIÊNG) ---

const App = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // State để quản lý Modal Đăng nhập/Đăng ký
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false); 
    
  // State quản lý Firebase
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  
  // State quản lý Vai trò và Username
  const [userRole, setUserRole] = useState(null); // 'admin', 'user', or null (loading)
  const [username, setUsername] = useState(null); // Tên ID của người dùng (email/username/uid)
  const isAdmin = userRole === 'admin';
  
  // State quản lý dữ liệu Favorites từ Firestore
  const [favorites, setFavorites] = useState(null); // null: loading, []: empty array

  const toggleMenu = () => {
    setIsMenuOpen(prev => !prev);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Lấy App ID từ biến global
  const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

  // Hàm tạo đường dẫn Collection Favorites (Private)
  const getFavoritesCollectionRef = useCallback((dbInstance, currentUserId) => {
    if (!dbInstance || !currentUserId) return null;
    // Đường dẫn riêng tư: /artifacts/{appId}/users/{userId}/favorite_courses
    return collection(dbInstance, 'artifacts', appId, 'users', currentUserId, 'favorite_courses');
  }, [appId]);

  // Đường dẫn Document Role (Public): /artifacts/{appId}/public/data/roles/{userId}
  const getRolesDocRef = useCallback((dbInstance, currentUserId) => {
    if (!dbInstance || !currentUserId) return null;
    return doc(dbInstance, 'artifacts', appId, 'public', 'data', 'roles', currentUserId);
  }, [appId]);
  
  // Đường dẫn Collection Role (Public): /artifacts/{appId}/public/data/roles
  const getRolesCollectionRef = useCallback((dbInstance) => {
    if (!dbInstance) return null;
    return collection(dbInstance, 'artifacts', appId, 'public', 'data', 'roles');
  }, [appId]);


  // 1. Khởi tạo Firebase và Xử lý Xác thực Ban đầu
  useEffect(() => {
    const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
    const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

    if (Object.keys(firebaseConfig).length === 0) {
        console.error("Firebase config is missing.");
        return;
    }

    try {
        const app = initializeApp(firebaseConfig);
        const authInstance = getAuth(app);
        const dbInstance = getFirestore(app);
        
        setAuth(authInstance);
        setDb(dbInstance);

        const unsubscribe = onAuthStateChanged(authInstance, (user) => {
            if (user) {
                setUserId(user.uid);
            } else {
                setUserId(null);
                setFavorites([]);
                setUserRole(null); 
                setUsername(null);
            }
            setIsAuthReady(true);
        });

        const signInUser = async () => {
            try {
                if (initialAuthToken) {
                    await signInWithCustomToken(authInstance, initialAuthToken);
                } else {
                    await signInAnonymously(authInstance);
                }
            } catch (error) {
                console.error("Error signing in:", error);
                setIsAuthReady(true); 
            }
        };

        signInUser();
        return () => unsubscribe(); 
        
    } catch (error) {
        console.error("Firebase initialization failed:", error);
        setIsAuthReady(true);
    }
  }, []);
  
  // 2. Logic Phân quyền: Lắng nghe/Thiết lập Vai trò và Username
  useEffect(() => {
    // !!! QUAN TRỌNG: Chỉ chạy sau khi Auth sẵn sàng và có userId chính xác
    if (!isAuthReady || !db || !userId || !auth) {
        console.log("[Role Setup] Waiting for Auth readiness or userId.");
        setUserRole(null);
        setUsername(null);
        return;
    }
    console.log(`[Role Setup] Auth Ready. Attempting to get/set role for UID: ${userId}`);


    const rolesDocRef = getRolesDocRef(db, userId);
    const rolesCollectionRef = getRolesCollectionRef(db);
    
    // Lắng nghe vai trò theo thời gian thực
    const unsubscribe = onSnapshot(rolesDocRef, async (docSnap) => {
        const currentUser = auth.currentUser;
        
        if (docSnap.exists()) {
            const data = docSnap.data();
            setUserRole(data.role);
            setUsername(data.username);
            // Lưu lại UID của Admin (tài khoản hiện tại) vào localStorage để tham chiếu
            if (data.role === 'admin') {
                localStorage.setItem('adminUid', userId);
            }
        } else {
            // Vai trò chưa tồn tại -> Thiết lập vai trò ban đầu
            
            let newRole = 'user';
            let defaultUsername = currentUser?.email || currentUser?.uid;
            if (!defaultUsername) {
                defaultUsername = userId;
            }

            // 1. Kiểm tra xem đã có admin nào chưa (Query để đảm bảo chỉ có 1 admin ban đầu)
            let adminExists = false;
            try {
                // Query roles collection for an existing admin
                const adminQuery = query(rolesCollectionRef, where('role', '==', 'admin'));
                const adminSnapshot = await getDocs(adminQuery);
                if (!adminSnapshot.empty) {
                    adminExists = true;
                }
            } catch (queryError) {
                // If query fails (e.g., Missing permissions), assume admin exists as a safe fallback
                console.warn("Error querying for existing admin roles (Permission issue expected). Assuming admin exists to prevent runaway admin creation.");
                adminExists = true; 
            }

            // 2. Nếu chưa có admin nào, gán vai trò admin cho user hiện tại (người dùng đầu tiên)
            if (!adminExists) {
                 newRole = 'admin';
                 defaultUsername = ADMIN_USERNAME; // Set the default admin username
            }

            try {
                 const newRoleData = { 
                    role: newRole, 
                    uid: userId, 
                    username: defaultUsername, 
                    assignedAt: new Date().toISOString() 
                 };
                 await setDoc(rolesDocRef, newRoleData);
                 setUserRole(newRole);
                 setUsername(defaultUsername);
                 console.log(`[Role Setup] User ${userId} set as ${newRole} with username ${defaultUsername}.`);
                 if (newRole === 'admin') {
                    localStorage.setItem('adminUid', userId);
                 }
            } catch (error) {
                 console.error("Error setting initial role (Permission?):", error);
                 setUserRole('user'); // Fallback nếu không thể ghi
                 setUsername(defaultUsername);
            }
        }
    }, (error) => {
        // Log lỗi này, thường là do thiếu quyền truy cập Firestore
        console.error("Error listening to user role (Missing permissions?):", error);
        setUserRole('user'); // Fallback
    });

    return () => unsubscribe(); 
  }, [isAuthReady, db, userId, auth, getRolesDocRef, getRolesCollectionRef]);


  // 4. Lắng nghe Dữ liệu Favorites từ Firestore (Logic cũ)
  useEffect(() => {
    // !!! QUAN TRỌNG: Chỉ chạy sau khi Auth sẵn sàng và có userId chính xác
    if (!isAuthReady || !db || !userId) {
        if (isAuthReady && !userId) {
            setFavorites([]); // Nếu Auth sẵn sàng nhưng không có User (đã đăng xuất)
        }
        console.log("[Favorites Setup] Waiting for Auth readiness or userId.");
        return;
    }
    console.log(`[Favorites Setup] Auth Ready. Attempting to get favorites for UID: ${userId}`);

    const favoritesColRef = getFavoritesCollectionRef(db, userId);
    if (!favoritesColRef) return;

    setFavorites(null); // Bắt đầu loading

    const unsubscribe = onSnapshot(favoritesColRef, (snapshot) => {
        const favoritesList = snapshot.docs.map(doc => ({
            firestoreId: doc.id,
            ...doc.data()
        }));
        setFavorites(favoritesList);
        console.log(`[Favorites] Loaded ${favoritesList.length} items.`);
    }, (error) => {
        // Log lỗi này, thường là do thiếu quyền truy cập Firestore
        console.error("Error listening to favorites (Missing permissions?):", error);
        setFavorites([]);
    });

    return () => unsubscribe(); 
  }, [isAuthReady, db, userId, getFavoritesCollectionRef]);


  // Xử lý Đăng Xuất
  const handleSignOut = useCallback(async () => {
    if (auth) {
        try {
            await signOut(auth);
            console.log("User signed out successfully.");
        } catch (error) {
            console.error("Sign out error:", error);
        }
    }
  }, [auth]);

  // XỬ LÝ ĐĂNG KÝ EMAIL/MẬT KHẨU (Bổ sung Username)
  const handleEmailSignUp = useCallback(async (email, password, newUsername) => {
      if (!auth || !db) throw new Error("Authentication or Database not initialized.");

      // 1. Kiểm tra tính duy nhất của Username (Kiểm tra trong collection roles)
      const rolesCollectionRef = getRolesCollectionRef(db);
      // NOTE: We assume security rules permit reading this public collection, 
      // but only run this query if DB is initialized.
      const usernameQuery = query(rolesCollectionRef, where('username', '==', newUsername));
      const querySnapshot = await getDocs(usernameQuery); 

      if (!querySnapshot.empty) {
          // Ném lỗi để AuthModal bắt và hiển thị
          throw new Error("Tên ID (Username) đã tồn tại. Vui lòng chọn ID khác.");
      }
      
      try {
          // 2. Tạo User trong Firebase Auth
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const newUser = userCredential.user;

          // 3. Gán vai trò và Username vào Firestore
          const rolesDocRef = getRolesDocRef(db, newUser.uid);
          const newRoleData = { 
              role: 'user', 
              uid: newUser.uid, 
              username: newUsername, // LƯU USERNAME CHỌN
              assignedAt: new Date().toISOString() 
          };
          // NOTE: setDoc will trigger the onSnapshot listener in useEffect 2
          await setDoc(rolesDocRef, newRoleData);

          // onAuthStateChanged sẽ tự động kích hoạt và cập nhật UI/State
          setIsAuthModalOpen(false);
          
      } catch (error) {
           // Bắt lỗi operation-not-allowed khi đăng ký
           if (error.code === 'auth/operation-not-allowed') {
               throw new Error("Đăng ký Email/Mật khẩu hiện đang bị vô hiệu hóa bởi quản trị viên hệ thống. Vui lòng liên hệ hỗ trợ.");
           }
           // Re-throw các lỗi khác
           throw error; 
      }
  }, [auth, db, getRolesCollectionRef, getRolesDocRef]);

  // XỬ LÝ ĐĂNG NHẬP EMAIL/MẬT KHẨU (Không thay đổi)
  const handleEmailSignIn = useCallback(async (email, password) => {
      if (!auth) throw new Error("Authentication not initialized.");
      
      try {
        await signInWithEmailAndPassword(auth, email, password);
        setIsAuthModalOpen(false);
      } catch (error) {
           // Bắt lỗi operation-not-allowed khi đăng nhập
           if (error.code === 'auth/operation-not-allowed') {
               throw new Error("Đăng nhập Email/Mật khẩu hiện đang bị vô hiệu hóa bởi quản trị viên hệ thống. Vui lòng liên hệ hỗ trợ.");
           }
           // Re-throw các lỗi khác
           throw error; 
      }
  }, [auth]);


  // Xử lý Thêm/Xóa Khóa học Yêu thích
  const handleToggleFavorite = useCallback(async (course, isFavorite) => {
    if (!db || !userId) {
        console.log("Authentication not ready. Cannot save data.");
        // Hiển thị modal đăng nhập nếu chưa đăng nhập
        if (!userId) {
            setIsAuthModalOpen(true);
        }
        return;
    }

    const favoritesColRef = getFavoritesCollectionRef(db, userId);
    if (!favoritesColRef) return;
    
    const courseDocRef = doc(favoritesColRef, course.id); 

    try {
        if (isFavorite) {
            await deleteDoc(courseDocRef);
            console.log(`[Favorites] Removed course: ${course.id}`);
        } else {
            const newFavorite = {
                id: course.id,
                title: course.title,
                price: course.price,
                addedAt: new Date().toISOString()
            };
            await setDoc(courseDocRef, newFavorite);
            console.log(`[Favorites] Added course: ${course.id}`);
        }
    } catch (e) {
        console.error("Error processing favorite course (Permission?):", e);
    }
  }, [db, userId, getFavoritesCollectionRef]);


  // Đóng menu khi resize về desktop (Logic chung)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        closeMenu();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* 1. Code Chung: Header */}
      <Header 
        onMenuToggle={toggleMenu} 
        username={username} // TRUYỀN USERNAME
        userId={userId} 
        userRole={userRole}
        onSignOut={handleSignOut}
        isAdmin={isAdmin}
        onSignInClick={() => setIsAuthModalOpen(true)}
      />
      
      {/* 2. Nội dung chính: Trang Chủ */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow">
          {/* Hiển thị thông báo chờ nếu Auth chưa sẵn sàng */}
          {!isAuthReady && (
              <div className="text-center p-4 mb-8 bg-yellow-100 text-yellow-800 rounded-xl font-medium">
                  Đang kết nối tới hệ thống... Vui lòng chờ.
              </div>
          )}

          <HeroSection />
          
          {/* Khóa học nổi bật - Cho phép thêm/xóa Favorites */}
          {favorites !== null && (
            <FeaturedCourses 
                favorites={favorites} 
                onToggleFavorite={handleToggleFavorite}
            />
          )}

          {/* Khóa học Cá nhân - Hiển thị danh sách Favorites */}
          <PersonalCourses 
              favorites={favorites} 
              onToggleFavorite={handleToggleFavorite}
          />
          
          {/* Bảng Quản trị Admin (CHỈ HIỂN THỊ NẾU LÀ ADMIN VÀ SẴN SÀNG) */}
          {isAuthReady && isAdmin && (
            <AdminPanel 
                userRole={userRole} 
                db={db} 
                appId={appId}
            />
          )}

      </main>
      
      {/* 3. Code Chung: Footer */}
      <Footer />

      {/* 4. Code Chung: Menu Mobile Overlay */}
      <MobileMenu 
        isMenuOpen={isMenuOpen} 
        onClose={closeMenu} 
        username={username} // TRUYỀN USERNAME
        userId={userId} 
        userRole={userRole}
        onSignOut={handleSignOut}
        onSignInClick={() => setIsAuthModalOpen(true)}
      />
      
      {/* Overlay mờ khi menu mở */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black opacity-30 z-40 md:hidden" 
          onClick={closeMenu}
        />
      )}
      
      {/* 5. Modal Đăng nhập/Đăng ký */}
      <AuthModal 
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSignIn={handleEmailSignIn}
          onSignUp={handleEmailSignUp}
      />
    </div>
  );
};

export default App;
