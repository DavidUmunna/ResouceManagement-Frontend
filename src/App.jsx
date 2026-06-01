import React, { useState, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import * as Sentry from '@sentry/react'
import { isProd } from "./components/env";
import "./index.css";
import Logout from "./components/logout";
import Adminlogin from "./pages/admin_login";
import axios from "axios"
import ForgotPassword from "./pages/forgotpassword";
import Landingpage from "./pages/landinpage/Resourcelanding" 
import Aboutus from "./pages/landinpage/Aboutus/main";
import Layout from "./pages/landinpage/layout/Layout"
import PrivateRoute from "./pages/PrivateRoute";
import ProtectedLayout from "./ProtectedLayout";
import ResetPassword from "./pages/ResetPassword";
import CompanyDataForm from "./pages/landinpage/CompanyData";
import { ToastContainer } from 'react-toastify';
import SubscriptionPage from "./pages/landinpage/Subscription";
// Pagetransition animation

const App = () => {
  const location = useLocation();
  const [isauthenticated, setisauthenticated] = useState(false);
 
  
  useEffect(() => {
    // Fetch CSRF token on app load
    const check_csrf=()=>{
        const API = process.env.REACT_APP_API_URL;
      axios.get(`${API}/api/csrf-token`,{withCredentials:true})
      
      .catch(err => {
        console.error('Failed to fetch CSRF token:', err);
      });
    }
    if(isauthenticated){
      check_csrf()
    }
    
  }, [isauthenticated]);

  useEffect(() => {
    
    
    
    const checkAuth = async () => {
      try {

 
        const API = process.env.REACT_APP_API_URL;
        const response = await axios.get(`${API}/api/access`, {
          headers: {
             
            "ngrok-skip-browser-warning": "true",  // Move inside headers
          },
          withCredentials: true, // Not inside headers
        });
       
        setisauthenticated(response.data.authenticated);
      } catch (error) {
        setisauthenticated(false);

        if (isProd) Sentry.captureException(error)
      }
    };
    
    checkAuth()
    const Timer =setInterval(()=>{
      
      checkAuth();
    },15*60*1000)
    return () => clearInterval(Timer)
    
  }, []);

 


  return (
    

      
        <div className="min-h-screen bg-gray-100 w-full  px-0 ">
          {/* Show Navbar only if user is authenticated */}
          
  
          
            
            <Routes location={location} >
              <Route path="/" element={<Layout/>}>
              
                <Route index element={<Landingpage/>}/>
                <Route path="/aboutus" element={<Aboutus/>}/>
                <Route path="/companydata" element={<CompanyDataForm/>}/>
                <Route path="/subscription" element={<SubscriptionPage/>}/>
              </Route>
              <Route
                path="/adminlogin"
                element={
                  
                   
                      <Adminlogin setAuth={setisauthenticated}  />
                  
                 
                }
              />
              <Route
                 path="/*"
                 element={
                   <PrivateRoute >
                   

                     <ProtectedLayout
                       isauthenticated={isauthenticated}
                       setisauthenticated={setisauthenticated}
                       />
                    
                   </PrivateRoute>
                 }
               />
               <Route path="/forgotpassword"
                element={
                 
                    <ForgotPassword/>
                  
                }/>
                 <Route path="/reset-password"
                element={
                  
                    <ResetPassword/>
                  
                }/>
                <Route
                  path="signout"
                  element={<Logout setAuth={setisauthenticated} />}
                  />
            </Routes>
            <ToastContainer/>
        </div>
      
    
  );
};

export default App;
