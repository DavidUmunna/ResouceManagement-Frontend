import { Outlet } from "react-router-dom";
import Navbar from "./navBar";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import NavbarSkeleton from "../skeletons/Navbar_skeleton";

import Footer from "./Footer/footer";

function AppLayout({ isLoading = false }) {
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col">
      {/* Persistent Navbar */}
      {isLoading ? <NavbarSkeleton /> : <Navbar />}
      
      {/* Animated content area */}
      <main className="flex-1 relative">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.25,
            ease: "easeInOut",
            type: "tween" 
          }}
          className="relative "
        >
          <Outlet />
        </motion.div>
      </main>
       {!isLoading && <Footer />}
    </div>
  );
}

export default AppLayout;