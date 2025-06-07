"use client";
import { createContext, useContext } from "react";

const StockTypeContext = createContext("pharmacy"); // default is pharmacy

export const useStockType = () => useContext(StockTypeContext);

export function StockTypeProvider({ type, children }) {
  return (
    <StockTypeContext.Provider value={type}>
      {children}
    </StockTypeContext.Provider>
  );
}
