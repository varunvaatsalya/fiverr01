import Navbar from "@/app/components/Navbar";
import EditStockForm from "@/app/components/EditStockForm";

function Page() {
  return (
    <div>
      <Navbar route={["Pharmacy", "GoDown", "Edit Stock"]} />
      <EditStockForm />
    </div>
  );
}

export default Page;
