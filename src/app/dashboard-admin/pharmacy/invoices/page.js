"use client";
import React, { useEffect, useState } from "react";
import PharmacyInvoiceSearchList from "../../../components/PharmacyInvoiceSearchList";
function Page() {
  const [invoices, setInvoices] = useState([]);
  const [accessInfo, setAccessInfo] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  useEffect(() => {
    async function fetchData(page) {
      try {
        let result = await fetch(`/api/newPharmacyInvoice?page=${page}`);
        result = await result.json();
        if (result.success) {
          console.log(1212, result);
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
    }
    fetchData(page);
  }, [page]);
  return (
    <>
      <PharmacyInvoiceSearchList
        page={page}
        setPage={setPage}
        totalPages={totalPages}
        invoices={invoices}
        setInvoices={setInvoices}
        accessInfo={accessInfo}
      />
    </>
  );
}

export default Page;
