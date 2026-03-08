import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion as Motion } from "framer-motion";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Footer from "./Footer";

const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.24, ease: "easeOut" },
};

const DashboardShell = ({ children, pendingCount = 0 }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const sync = () => setIsDesktop(window.innerWidth >= 768);
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  const pageKey = useMemo(() => location.pathname, [location.pathname]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="bg-app flex min-h-screen text-slate-800">
      <Sidebar
        isOpen={isDesktop || sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        pendingCount={pendingCount}
      />

      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          pendingCount={pendingCount}
          onLogout={handleLogout}
        />

        <main className="flex-1 px-4 pb-8 sm:px-6">
          <AnimatePresence mode="wait">
            <Motion.div key={pageKey} {...pageTransition}>
              {children}
            </Motion.div>
          </AnimatePresence>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default DashboardShell;
