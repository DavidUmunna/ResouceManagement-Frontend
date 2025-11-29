import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navLinks = [
    { id: 1, text: "About us", to:"/aboutus" },
    //{id:2, text:"Subscription", to:"/subscription"}
    //{ id: 2, text: "Pricing", to: "#pricing" },
  ];

  return (
    <nav className="bg-white shadow-sm fixed top-0 left-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link to={"/"}>
            <span className="text-xl font-bold text-gray-800">ResourceFlow</span>
            </Link>
          </div>

          {/* Desktop Navigation (hidden on mobile) */}
          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.id}
                to={link.to}
                className=" cursor-pointer text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                {link.text}
              </Link>
            ))}
            <button
            onClick={()=>navigate("/companydata")}            
            className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm">
              Get Started
            </button>
            <button
              className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm"
              onClick={() => navigate("/adminlogin")}
            >
              Log In
            </button>
          </div>

          {/* Mobile menu button (visible only on mobile) */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-indigo-600 focus:outline-none"
              aria-expanded="false"
            >
              {isMobileMenuOpen ? (
                <FaTimes className="h-6 w-6" />
              ) : (
                <FaBars className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu (animated) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white border-t border-gray-200"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navLinks.map((item) => (
                <Link
                  key={item.id}
                  to={item.to}
                  className=" cursor-pointer block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-indigo-600  hover:bg-gray-50 "
                 
                
                >
                  {item.text}
                </Link>
              ))}
              <button
              onClick={()=>navigate("/companydata")}
               className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white bg-gray-800 hover:bg-indigo-700">
                Get Started
              </button>
              <button
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white bg-gray-800 hover:bg-indigo-700"
                onClick={() => {
                  navigate("/adminlogin");
                  setIsMobileMenuOpen(false);
                }}
              >
                Log In
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;