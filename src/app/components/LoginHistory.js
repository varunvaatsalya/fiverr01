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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { formatDateTimeToIST } from "../utils/date";

export default function LoginHistory() {
  const [loginHistorys, setLoginHistorys] = useState([]);
  const [selectedLoginHistory, setSelectedLoginHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("page", page.toString());
        if (role) params.set("role", role);

        if (status) params.set("status", status);
        let result = await fetch(`/api/loginHistory?${params.toString()}`);
        result = await result.json();
        if (result.success) {
          setLoginHistorys(result.history);
          setTotalPages(result.totalPages);
        }
      } catch (err) {
        console.log("error: ", err);
      }
      setLoading(false);
    }
    fetchData();
  }, [page, role, status]);

  return (
    <div className="p-2 flex-1 min-h-0 flex items-center flex-col gap-1">
      <div className="flex items-center gap-4 mb-4">
        <Select
          onValueChange={(value) => {
            setRole(value === "all" ? "" : value);
          }}
        >
          <SelectTrigger className="w-[150px] text-black bg-white">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="salesman">Salesman</SelectItem>
            <SelectItem value="nurse">Nurse</SelectItem>
            <SelectItem value="owner">Owner</SelectItem>
            <SelectItem value="pathologist">Pathologist</SelectItem>
            <SelectItem value="dispenser">Dispenser</SelectItem>
            <SelectItem value="stockist">Stockist</SelectItem>
          </SelectContent>
        </Select>

        <Select
          onValueChange={(value) => {
            setStatus(value === "all" ? "" : value);
          }}
        >
          <SelectTrigger className="w-[150px] text-black bg-white">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2 flex-1 overflow-y-auto w-full md:w-4/5 lg:w-3/5">
        {loading
          ? Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="w-full h-16" />
            ))
          : loginHistorys.map((loginHistory) => (
              <Card
                key={loginHistory._id}
                className="p-4 flex justify-between items-center"
              >
                <div className="w-3/5">
                  <p className="text-sm text-muted-foreground font-semibold">
                    {loginHistory.role +
                      ` (${loginHistory.attemptedUserEmail})`}
                  </p>
                  <p className="text-xs">
                    {formatDateTimeToIST(loginHistory.loginTime)}
                  </p>
                </div>
                <div
                  className={
                    "font-semibold rounded-lg px-2 " +
                    (loginHistory.status === "success"
                      ? "bg-green-300 text-green-800"
                      : "bg-red-200 text-red-800")
                  }
                >
                  {loginHistory.status}
                </div>
                <Button
                  onClick={() => setSelectedLoginHistory(loginHistory)}
                  size="sm"
                >
                  View Deatils
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
        open={!!selectedLoginHistory}
        onOpenChange={() => setSelectedLoginHistory(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto text-black">
          <DialogHeader>
            <DialogTitle>LoginHistory Details</DialogTitle>
          </DialogHeader>
          {selectedLoginHistory && (
            <div className="text-sm space-y-2 text-muted-foreground">
              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={
                    "font-semibold rounded px-2 py-0.5 " +
                    (selectedLoginHistory.status === "success"
                      ? "bg-green-300 text-green-800"
                      : "bg-red-200 text-red-800")
                  }
                >
                  {selectedLoginHistory.status}
                </span>
              </p>
              <p>
                <strong>Role:</strong> {selectedLoginHistory.role}
              </p>
              <p>
                <strong>Attempted Email Id:</strong>{" "}
                {selectedLoginHistory.attemptedUserEmail}
              </p>
              <p>
                <strong>IP Address:</strong> {selectedLoginHistory.ipAddress}
              </p>
              <p>
                <strong>User Agent:</strong> {selectedLoginHistory.userAgent}
              </p>
              <p>
                <strong>attempted At:</strong>{" "}
                {formatDateTimeToIST(selectedLoginHistory.loginTime)}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
