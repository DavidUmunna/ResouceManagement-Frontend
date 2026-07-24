import { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import * as Sentry from "@sentry/react"
import { isProd } from "./env";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Axios request to validate session
    let isMounted = true;

    const AuthProvider=async()=>{

        const API = process.env.REACT_APP_API_URL;
        await axios
        .get(`${API}/api/access`, {withCredentials: true }) // include cookies if using httpOnly tokens
        .then((res) => {
            if (!isMounted) return;
            setUser(res.data.user || null);
            if (res.data.user) {
              sessionStorage.setItem("user", JSON.stringify(res.data.user));
            } else {
              sessionStorage.removeItem("user");
            }
        })
        .catch((err) => {
          if (!isMounted) return;
          if(isProd){

            Sentry.captureMessage("Not authenticated");
            Sentry.captureException(err)
          }
            setUser(null);
            sessionStorage.removeItem("user");
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    }

    AuthProvider();
   
    const Timer=setInterval(()=>{
          AuthProvider();
    },16*60*1000)
    return ()=>{
      isMounted = false;
      clearInterval(Timer)
    }

}, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading, isAuthenticated: !!user }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
