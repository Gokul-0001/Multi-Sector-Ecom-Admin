import { NavLink, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FaHome, FaBox, FaUsers, FaClipboardList, FaUserTie,
  FaTruck, FaTicketAlt, FaImage, FaStar,
  FaCog, FaSignOutAlt,
} from 'react-icons/fa';

const menuItems = [
  { path: '/dashboard', icon: <FaHome />,         label: 'Dashboard' },
  { path: '/products',  icon: <FaBox />,           label: 'Products'  },
  { path: '/orders',    icon: <FaClipboardList />, label: 'Orders'    },
  { path: '/customers', icon: <FaUsers />,         label: 'Customers' },
  { path: '/drivers',   icon: <FaUserTie />,       label: 'Drivers'   },
  { path: '/vehicles',  icon: <FaTruck />,         label: 'Vehicles'  },
  { path: '/coupons',   icon: <FaTicketAlt />,     label: 'Coupons'   },
  { path: '/banners',   icon: <FaImage />,         label: 'Banners'   },
  { path: '/reviews',   icon: <FaStar />,          label: 'Reviews'   },
  { path: '/settings',  icon: <FaCog />,           label: 'Settings'  },
];

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    toast.success('Logged out successfully!');
    navigate('/login');
  };

  return (
    <aside className={`
      fixed top-0 left-0 h-screen w-[220px]
      bg-white border-r border-[#f0f0f0] z-40
      flex flex-col
      transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
      lg:translate-x-0
      ${isOpen ? 'translate-x-0 shadow-[4px_0_24px_rgba(0,0,0,0.08)]' : '-translate-x-full'}
    `}>

      {/* Brand */}
      <div className="h-[60px] flex items-center px-4 flex-shrink-0 border-b border-[#f0f0f0]">
        <NavLink to="/dashboard" className="flex items-center gap-2.5 no-underline">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0
            bg-gradient-to-br from-pink-500 to-pink-700
            shadow-[0_4px_12px_rgba(236,72,153,0.3)]">
            <i className="fas fa-shopping-bag text-white text-sm" />
          </div>
          <span className="text-[15px] font-extrabold tracking-tight text-gray-900">
            Multi<span className="text-pink-500">Ecom</span>
          </span>
        </NavLink>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2.5 py-3 overflow-y-auto">
        <ul className="list-none p-0 m-0 flex flex-col gap-0.5">
          {menuItems.map(item => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                onClick={() => { if (window.innerWidth < 1024) toggleSidebar(); }}
                className={({ isActive }) => `
                  flex items-center gap-2.5 px-3 py-2.5 rounded-xl
                  no-underline text-sm font-semibold
                  transition-all duration-200
                  ${isActive
                    ? 'bg-pink-50 text-pink-500'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                  }
                `}
              >
                {({ isActive }) => (
                  <>
                    <span className={`
                      w-[3px] h-[18px] rounded-full flex-shrink-0
                      transition-colors duration-200
                      ${isActive ? 'bg-pink-500' : 'bg-transparent'}
                    `} />
                    <span className={`text-sm transition-colors duration-200
                      ${isActive ? 'text-pink-500' : 'text-gray-300'}`}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <div className="px-2.5 py-3 flex-shrink-0 border-t border-[#f0f0f0]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl
            text-sm font-semibold cursor-pointer border-none
            bg-pink-50 text-pink-500
            hover:bg-gradient-to-r hover:from-pink-500 hover:to-pink-700
            hover:text-white hover:shadow-[0_4px_12px_rgba(236,72,153,0.3)]
            transition-all duration-200"
        >
          <FaSignOutAlt className="text-sm" />
          Logout
        </button>
      </div>

    </aside>
  );
};

export default Sidebar;
