"use client";
import { createContext, useContext, useState } from "react";

// Create Context
const RoleContext = createContext();

// Create Provider
export const RoleProvider = ({ children }) => {
  const [role, setRole] = useState(null);
  const [isPrint, setIsPrint] = useState(false);

  return (
    <RoleContext.Provider value={{ role, setRole, isPrint, setIsPrint }}>
      {children}
    </RoleContext.Provider>
  );
};

// Custom hook for accessing the role context
export const useRole = () => useContext(RoleContext);
