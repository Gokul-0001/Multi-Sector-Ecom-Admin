import { FaBars, FaBell, FaUserCircle } from 'react-icons/fa';

const Header = ({ toggleSidebar }) => {
  const adminName = localStorage.getItem('adminName') || 'Admin';

  return (
    <header className="h-[60px] flex items-center justify-between px-6
      flex-shrink-0 sticky top-0 z-20
      bg-white border-b border-[#f0f0f0]">

      {/* Hamburger — mobile only */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden p-2 rounded-xl border-none bg-transparent
          cursor-pointer text-gray-400 hover:text-pink-500
          hover:bg-pink-50 transition-all duration-200"
      >
        <FaBars className="text-[15px]" />
      </button>

      <div className="flex-1" />

      {/* Right actions */}
      <div className="flex items-center gap-3">

        {/* Notification bell */}
        <button className="relative w-9 h-9 rounded-xl flex items-center justify-center
          border-none bg-transparent cursor-pointer
          text-gray-400 hover:text-pink-500 hover:bg-pink-50
          transition-all duration-200">
          <FaBell className="text-[15px]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2
            rounded-full bg-pink-500" />
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-[#f0f0f0]" />

        {/* Admin profile */}
        <div className="flex items-center gap-2 cursor-pointer
          px-2 py-1.5 rounded-xl hover:bg-pink-50 transition-all duration-200">
          <FaUserCircle className="text-[26px] text-gray-200" />
          <div className="hidden sm:flex flex-col">
            <span className="text-sm font-semibold text-gray-900 leading-tight">
              {adminName}
            </span>
            <span className="text-[11px] text-gray-400 font-medium leading-tight">
              Super Admin
            </span>
          </div>
        </div>

      </div>
    </header>
  );
};

export default Header;
