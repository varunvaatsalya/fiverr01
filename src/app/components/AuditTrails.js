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
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { formatDateTimeToIST } from "../utils/date";
import { showInfo } from "../utils/toast";

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

  const before = selectedAudit?.changes?.before;
  const after = selectedAudit?.changes?.after;
  const differences = getDifferences(before, after);

  function getDifferences(before, after) {
    if (
      typeof before !== "object" ||
      typeof after !== "object" ||
      before === null ||
      after === null
    ) {
      return before !== after ? after : undefined;
    }

    if (Array.isArray(before) || Array.isArray(after)) {
      return JSON.stringify(before) !== JSON.stringify(after)
        ? after
        : undefined;
    }

    const diff = {};

    for (const key of new Set([
      ...Object.keys(before || {}),
      ...Object.keys(after || {}),
    ])) {
      const beforeValue = before?.[key];
      const afterValue = after?.[key];

      const childDiff = getDifferences(beforeValue, afterValue);
      if (childDiff !== undefined) {
        diff[key] = childDiff;
      }
    }

    return Object.keys(diff).length > 0 ? diff : undefined;
  }

  async function removeAudit(id) {
    let confirm = window.confirm("Do you want to delete this audit!");
    if (!confirm) return;
    try {
      const response = await fetch(`/api/audits`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ auditId: id }),
      });

      const result = await response.json();
      if (result.success) {
        showInfo(result.message);
        setSelectedAudit(null);
        setAudits((prevAudits) =>
          prevAudits.filter((audits) => audits._id !== id)
        );
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  }

  return (
    <div className="p-2 flex-1 min-h-0 flex items-center flex-col gap-1">
      <div className="space-y-2 flex-1 overflow-y-auto w-full md:w-4/5 lg:w-3/5">
        {loading
          ? Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="w-full h-16" />
            ))
          : audits.map((audit) => (
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

      <div className="text-black">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              />
            </PaginationItem>
            <PaginationItem>
              <span className="text-sm">{page}</span>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  setPage((prev) => Math.min(prev + 1, totalPages))
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
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
              <button
                onClick={() => {
                  removeAudit(selectedAudit._id);
                }}
                className="py-1 px-3 text-sm text-red-700 border border-red-700 rounded-lg font-semibold flex gap-1 items-center"
              >
                Delete
              </button>
              <p>
                <strong>Resource:</strong> {selectedAudit.resourceType}
              </p>
              <p>
                <strong>Resource Id:</strong>{" "}
                {selectedAudit.resourceId?.pid ||
                  selectedAudit.resourceId?.inid ||
                  selectedAudit.resourceId?.uhid}
              </p>

              <p>
                <strong>Edited By Role:</strong> {selectedAudit.editedByRole} (
                {selectedAudit.editedBy?.name || "--"})
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
                  <h4 className="font-semibold text-primary">
                    Changed (Before)
                  </h4>
                  <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-64">
                    {JSON.stringify(getDifferences(after, before), null, 2)}
                  </pre>
                </div>
                <div>
                  <h4 className="font-semibold text-primary">
                    Changed (After)
                  </h4>
                  <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-64">
                    {JSON.stringify(differences, null, 2)}
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
