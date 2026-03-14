import axios from "axios";
import { useNavigate } from "react-router-dom";
import AdminImg from "../components/assets/haldenlogo_copy.png"
import { useUser } from "../components/usercontext";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {Link} from "react-router-dom"
//import { getCookie } from "../components/Helpers";
import * as Sentry from "@sentry/react"
import { isProd } from "../components/env";
export default function Sign_in({ setAuth }) {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    
    setLoading(true);
    try {
      const API_URL = process.env.REACT_APP_API_URL;
     const response = await axios.post(
  `${API_URL}/api/admin-user/login`,
  { username, password },
  {withCredentials: true
    }
     );


    if (response.data.success===true) {
        setAuth(true);


        //localStorage.setItem("auth", "true");
        setUser(response.data.user);
        //console.log(response.data.user)
        
        navigate("/admin/dashboard");
        //console.log(userData)
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      if (error.response) {
        setError(error.response.data.message || "Login failed.");
         if (isProd) Sentry.captureException(error)
      } else if (error.request) {
        //console.log(error.request)
        setError("Server is unreachable. Please check your connection.");
      } else {
        setError("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
      if (!setAuth) {
        setUsername("");
        setPassword("");
      }
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8"
        data-testid='pagelogin'
      >
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <motion.img
            src={AdminImg}
            alt="Halden"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            loading="eager"
            fetchpriority="high"
            className="mx-auto h-14 w-14 "
          />
          <h2 className="mt-10 text-center text-2xl font-bold tracking-tight text-gray-900">
              Sign in to Your Account
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <motion.form
            onSubmit={handleLogin}
            method="POST"
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          >
            <div>
              <div className="flex items-center justify-between">

                 <label htmlFor="username" className="block text-sm font-medium text-gray-900">
                   Username
                 </label>
                 <div className="text-sm">
                     <Link to="/" className="font-semibold text-indigo-600 hover:text-indigo-500">
                       Home
                     </Link>
                   </div>
                 </div>
              <div className="mt-2">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-none border border-gray-300 placeholder-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-gray-900">
                  Password
                </label>
                <div className="text-sm">
                  <Link to="/forgotpassword" className="font-semibold text-indigo-600 hover:text-indigo-500">
                    Forgot password?
                  </Link>
                </div>
              </div>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-none border border-gray-300 placeholder-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>
            </div>

            <div>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex w-full justify-center rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-md hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition"
              >
                {loading ? "Signing in..." : "Sign in"}
              </motion.button>
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                   className="p-3 mt-5 flex  justify-center items-center  text-red-600 border-l-4 border-red-500 bg-red-200"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.form>

          <div className="flex justify-center mt-6">
            <p className="text-center text-sm text-gray-500">
              Can't sign in?{" "}
              <span
                onClick={() => setIsVisible(!isVisible)}
                className="font-bold text-blue-700 cursor-pointer hover:underline"
              >
                Contact IT Team
              </span>
            </p>
          </div>

          {/* IT Contact Card */}
          <AnimatePresence>
            {isVisible && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="mt-6 w-full bg-white shadow-lg rounded-lg p-6"
              >
                <h2 className="text-xl font-bold text-gray-800">IT Support</h2>
                <p className="text-gray-600 mt-2">Need help? Contact our IT team.</p>

                <div className="mt-4">
                  <p className="text-gray-800 font-semibold">Email:</p>
                  <p className="text-gray-600">c.onu@haldengroup.ng</p>
                </div>

                <div className="mt-2">
                  <p className="text-gray-800 font-semibold">Phone:</p>
                  <p className="text-gray-600">+2347068911690</p>
                </div>

                <div className="mt-4">
                  <motion.button
                    onClick={() => setIsVisible(false)}
                    whileHover={{ scale: 1.05 }}
                    className="bg-red-500 text-white w-full py-2 rounded-lg hover:bg-red-600 transition"
                  >
                    Close
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

    </>
  );
}
