import { StockTypeProvider } from "@/app/context/StockTypeContext";

export default function HospitalPharmacyLayout({ children }) {
  return (
    <StockTypeProvider type="hospital">
      {children}
    </StockTypeProvider>
  );
}
