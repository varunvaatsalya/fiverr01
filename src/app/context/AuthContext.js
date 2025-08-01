// contexts/AuthContext.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserData() {
      setLoading(true);
      try {
        let result = await fetch("/api/auth");
        result = await result.json();
        if (result.success) {
          setUser(result.user);
        }
      } catch (error) {
        console.log("getting error while fetching Users Data.");
      } finally {
        setLoading(false);
      }
    }
    fetchUserData();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
