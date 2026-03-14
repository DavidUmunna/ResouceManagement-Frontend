import { Outlet } from "react-router-dom";
import Navbar from "./navBar";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { useEffect,useState } from "react";
import Footer from "./Footer/footer";

function AppLayout() {
  const location = useLocation();
   const [isReady, setIsReady] = useState(false);
   useEffect(() => {
    if (document.readyState === "complete") {
      setIsReady(true);
    } else {
      window.addEventListener("load", () => setIsReady(true));
    }
  }, []);
  return (
    <div className="flex min-h-screen flex-col">
      {/* Persistent Navbar */}
      <Navbar />
      
      {/* Animated content area */}
      <main className="flex-1 relative">
        {isReady&&(<motion.div
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
        </motion.div>)}
      </main>
      <Footer/>
    </div>
  );
}

export default AppLayout;