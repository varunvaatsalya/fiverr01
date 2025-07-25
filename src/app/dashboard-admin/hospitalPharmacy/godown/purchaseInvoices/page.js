"use client";
import React, { useEffect, useState } from "react";
import PurchaseInvoiceSearchList from "../../../../components/PurchaseInvoiceSearchList";
import { useStockType } from "@/app/context/StockTypeContext";

function Page() {
  const [purchaseInvoices, setPurchaseInvoices] = useState([]);
  const [accessInfo, setAccessInfo] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const sectionType = useStockType();

  useEffect(() => {
    async function fetchData(page) {
      try {
        let result = await fetch(
          `/api/newPurchaseInvoice?page=${page}${
            sectionType === "hospital" ? "&sectionType=hospital" : ""
          }`
        );
        result = await result.json();
        if (result.success) {
          setPurchaseInvoices(result.allPurchaseInvoices);
          setTotalPages(result.totalPages);
          setAccessInfo({
            accessRole: result.userRole,
            accessEditPermission: result.userEditPermission,
          });
        }
      } catch (err) {
        console.log("error: ", err);
      }
    }
    fetchData(page);
  }, [page]);

  return (
    <>
      <PurchaseInvoiceSearchList
        page={page}
        setPage={setPage}
        totalPages={totalPages}
        purchaseInvoices={purchaseInvoices}
        setPurchaseInvoices={setPurchaseInvoices}
        accessInfo={accessInfo}
      />
    </>
  );
}

export default Page;
