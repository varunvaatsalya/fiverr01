"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import NewMfgVendorForm from "./NewMfgVendorForm";

function MedicineMfgVendorList({ type, info }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    setData(info);
  }, [type]);

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 text-black">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold capitalize">{type}s</h2>
        <NewMfgVendorForm type={type} setData={setData} />
      </div>

      {
        <div className="space-y-4">
          {data.length === 0 ? (
            <p>No {type}s found.</p>
          ) : (
            data.map((item) => (
              <Card key={item._id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      {type === "vendor" && (
                        <>
                          <p className="text-muted-foreground text-sm">
                            Contact: {item.contact}
                          </p>
                          {item.address && (
                            <p className="text-sm">Address: {item.address}</p>
                          )}
                        </>
                      )}
                      {type === "manufacturer" &&
                        item.medicalRepresentator?.name && (
                          <p className="text-sm">
                            MR: {item.medicalRepresentator.name} (
                            {item.medicalRepresentator.contact})
                          </p>
                        )}

                      {item.bankDetails?.length > 0 && (
                        <div className="mt-2 text-sm space-y-1">
                          <Separator className="my-2" />
                          <p className="font-medium">Bank Details:</p>
                          {item.bankDetails.map((bank, idx) => (
                            <div
                              key={idx}
                              className="ml-2 text-muted-foreground"
                            >
                              <p>
                                Bank: {bank.bankName} ({bank.branch})
                              </p>
                              <p>Account No: {bank.accountNo}</p>
                              <p>IFSC: {bank.ifsc}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <NewMfgVendorForm
                      type={type}
                      data={item}
                      setData={setData}
                      triggerLabel="Edit"
                    />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      }
    </div>
  );
}

export default MedicineMfgVendorList;
