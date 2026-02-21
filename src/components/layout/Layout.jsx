import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleSidebar = () => setIsOpen(prev => !prev);

  return (
    <div className="min-h-screen bg-[#fafafa]">

      <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Main content */}
      <div className="lg:ml-[220px] min-h-screen flex flex-col">
        <Header toggleSidebar={toggleSidebar} />
        <main className="flex-1 p-6 fade-up">
          {children}
        </main>
      </div>

    </div>
  );
};

export default Layout;
