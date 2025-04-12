"use client";
import React, { useEffect, useState } from "react";
import PharmacyInvoiceSearchList from "../../components/PharmacyInvoiceSearchList";

function Page() {
  const [invoices, setInvoices] = useState([]);
  const [accessInfo, setAccessInfo] = useState(null);
  const [page, setPage] = useState(1);
  const [isReturn, setIsReturn] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    async function fetchData(page) {
      setIsLoading(true);
      try {
        let result = await fetch(
          `/api/newPharmacyInvoice?page=${page}&isReturn=${isReturn ? 1 : 0}`
        );
        result = await result.json();
        if (result.success) {
          setInvoices(result.allPharmacyInvoices);
          setTotalPages(result.totalPages);
          setAccessInfo({
            accessRole: result.userRole,
            accessEditPermission: result.userEditPermission,
          });
        }
      } catch (err) {
        console.log("error: ", err);
      }
      setIsLoading(false);
    }
    fetchData(page);
  }, [page, isReturn]);
  return (
    <>
      <PharmacyInvoiceSearchList
        page={page}
        setPage={setPage}
        totalPages={totalPages}
        invoices={invoices}
        setInvoices={setInvoices}
        accessInfo={accessInfo}
        isReturn={isReturn}
        setIsReturn={setIsReturn}
        isLoading={isLoading}
      />
    </>
  );
}

export default Page;
