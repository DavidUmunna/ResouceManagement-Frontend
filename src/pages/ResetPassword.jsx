import {useEffect, useState} from "react"
import { useNavigate, useLocation } from "react-router-dom";
import { updateUserpassword } from "../services/userService";



const ResetPassword=()=>{
    const [error, setError] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState("");
     const [step, setStep] = useState(1);
     const location=useLocation()
     const navigate=useNavigate()


    useEffect(()=>{
        const query = new URLSearchParams(location.search);
        const tokenFromUrl = query.get("token");
        if (tokenFromUrl) {
          setToken(tokenFromUrl);
          setStep(2); // Move to reset password step
        }



    },[location])

     const handleResetPassword = async () => {
        setError("");
    
        if (newPassword !== confirmPassword) {
          setError("Passwords do not match.");
          return;
        }
    
        setLoading(true);
    
        try {
          const response = await updateUserpassword(token, newPassword);
         
          if (response.success) {
            setStep(3); // success
          } else {
            setError("Reset failed. Invalid or expired token.");
          }
        } catch (error) {
          setError(error.response?.data?.message || "Something went wrong.");
        } finally {
          setLoading(false);
        }
      };
    
      const handleLoginRedirect = () => {
        navigate("/adminlogin");
      };


      return (
         <div className="flex justify-center items-center h-screen bg-gray-100">
            {step === 2 && (
          <div>
            
            <h2 className="text-xl font-bold mb-4">Reset Password</h2>
            <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-2 border rounded"
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2 border rounded mt-2"
              />
            <div className="flex">
              <button
                onClick={handleLoginRedirect}
                className="mt-4 w-full mx-2 bg-gray-500 text-white py-2 rounded"
                >
                Login
              </button>
              <button
                onClick={handleResetPassword}
                disabled={loading}
                className="mt-4 w-full bg-green-500 text-white py-2 rounded disabled:bg-gray-400"
                >
                {loading ? "Updating..." : "Reset Password"}
              </button>
            </div>
          
            {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
        )}

        {/* Password Reset Success */}
        {step === 3 && (
          <div>

            <h2 className="text-xl font-bold mb-4">Success!</h2>
            <p className="text-green-600">Your password has been reset.</p>
            <button
              onClick={handleLoginRedirect}
              className="mt-4 w-full bg-blue-500 text-white py-2 rounded"
              >
              Go to Login
            </button>
          
          </div>
        )}

         </div>
      )




}

export default ResetPassword