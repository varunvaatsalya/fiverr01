"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import { formatDateTimeToIST } from "../utils/date";

export default function AuditTrails() {
  const [audits, setAudits] = useState([]);
  const [selectedAudit, setSelectedAudit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        let result = await fetch(`/api/audits?page=${page}`);
        result = await result.json();
        if (result.success) {
          setAudits(result.audits);
          setTotalPages(result.totalPages);
        }
      } catch (err) {
        console.log("error: ", err);
      }
      setLoading(false);
    }
    fetchData();
  }, [page]);

  return (
    <div className="p-2 flex-1 flex justify-center">
      {loading ? (
        <Skeleton className="w-full md:w-4/5 lg:w-3/5 h-[400px]" />
      ) : (
        <div className="space-y-2 w-full md:w-4/5 lg:w-3/5">
          {audits.map((audit) => (
            <Card
              key={audit._id}
              className="p-4 flex justify-between items-center"
            >
              <div>
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold">{audit.resourceType}</span>{" "}
                  updated by{" "}
                  <span className="font-semibold">{audit.editedByRole}</span>
                  {audit.editedBy && audit.editedBy.name && (
                    <span className="font-semibold">{`(${audit.editedBy?.name})`}</span>
                  )}
                </p>
                <p className="text-xs">
                  {formatDateTimeToIST(audit.updatedAt)}
                </p>
              </div>
              <Button onClick={() => setSelectedAudit(audit)} size="sm">
                View Changes
              </Button>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-6">
        <Pagination page={page} setPage={setPage} totalPages={totalPages} />
      </div>

      <Dialog
        open={!!selectedAudit}
        onOpenChange={() => setSelectedAudit(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto text-black">
          <DialogHeader>
            <DialogTitle>Audit Details</DialogTitle>
          </DialogHeader>
          {selectedAudit && (
            <div className="text-sm space-y-2 text-muted-foreground">
              <p>
                <strong>Resource:</strong> {selectedAudit.resourceType}
              </p>
              <p>
                <strong>Action:</strong> {selectedAudit.action}
              </p>
              <p>
                <strong>Edited By Role:</strong> {selectedAudit.editedByRole} (
                {selectedAudit.editedByRole?.name || "--"})
              </p>
              <p>
                <strong>Updated At:</strong>{" "}
                {formatDateTimeToIST(selectedAudit.updatedAt)}
              </p>
              <p>
                <strong>Remarks:</strong> {selectedAudit.remarks}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-primary">Before</h4>
                  <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-64">
                    {JSON.stringify(selectedAudit.changes?.before, null, 2)}
                  </pre>
                </div>
                <div>
                  <h4 className="font-semibold text-primary">After</h4>
                  <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-64">
                    {JSON.stringify(selectedAudit.changes?.after, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
