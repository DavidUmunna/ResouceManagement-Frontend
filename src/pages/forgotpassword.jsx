/* eslint-disable  no-unused-vars */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { sendResetLink, } from "../services/userService"; // update these functions
import { useNavigate, useLocation } from "react-router-dom";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);
  
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");

  // Get token from URL
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const tokenFromUrl = query.get("token");
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      setStep(1); // Move to reset password step
    }
  }, [location]);

  const handleEmailSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const response = await sendResetLink(email);

     // assume success = true if mail sent
      if (response.data.success) {
        setStep(2); // show email sent message
      } else {
        setError(response.response.data?.message|| "Operation failed");
      }
    } catch (error) {
   
      setError(error?.response?.data.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };



  const handleLoginRedirect = () => {
    navigate("/adminlogin");
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-8 rounded-2xl shadow-lg w-96"
      >
        {/* Request Email Step */}
        {step === 1 && (
          <>
            <h2 className="text-xl font-bold mb-4">Forgot Password</h2>
            <p className="text-gray-600 mb-4">Enter your email to receive a reset link.</p>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <div className="flex">
              <button
                onClick={handleEmailSubmit}
                disabled={loading}
                className="mt-4 w-full mx-2 bg-blue-500 text-white py-2 rounded disabled:bg-gray-400"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
              <button
                onClick={handleLoginRedirect}
                className="mt-4 w-full mx-2 bg-gray-500 text-white py-2 rounded"
              >
                Login
              </button>
            </div>
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </>
        )}

       

        {/* Reset Link Sent */}
        {step === 2 && (
          <>
            <h2 className="text-xl font-bold mb-4">Email Sent</h2>
            <p className="text-gray-600">Check your email for a reset link.</p>
            <button
              onClick={handleLoginRedirect}
              className="mt-4 w-full bg-blue-500 text-white py-2 rounded"
            >
              Back to Login
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}
