import Navbar from "@/app/components/Navbar";
// import EditStockForm from "@/app/components/EditStockForm";

function Page() {
  return (
    <div>
      <Navbar route={["Pharmacy", "GoDown", "Edit Stock"]} />
      <div className="bg-red-500 text-center">Access denied</div>
      {/* <EditStockForm /> */}
    </div>
  );
}

export default Page;
