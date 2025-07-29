import Navbar from "@/app/components/Navbar";
import PurchaseInvoiceVerification from "@/app/components/PurchaseInvoiceVerification";

export default function Page() {
  return (
    <div className="flex flex-col min-h-screen h-screen">
      <Navbar route={["Godown", "Stock Confirmation"]} />
      <PurchaseInvoiceVerification />
    </div>
  );
}
