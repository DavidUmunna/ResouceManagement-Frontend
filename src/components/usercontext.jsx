import { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import * as Sentry from "@sentry/react"
import { isProd } from "./env";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Axios request to validate session

    const AuthProvider=async()=>{

        const API = process.env.REACT_APP_API_URL;
        await axios
        .get(`${API}/api/access`, {withCredentials: true }) // include cookies if using httpOnly tokens
        .then((res) => {
            setUser(res.data.user);
            sessionStorage.setItem("user", JSON.stringify(res.data.user));
        })
        .catch((err) => {
          if(isProd){

            Sentry.captureMessage("Not authenticated");
            Sentry.captureException(err)
          }
            setUser(null);
            sessionStorage.removeItem("user");
        })
        .finally(() => setLoading(false));
    }
   
    const Timer=setInterval(()=>{
          AuthProvider();
    },16*60*1000)
    return ()=>clearInterval(Timer)

}, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
