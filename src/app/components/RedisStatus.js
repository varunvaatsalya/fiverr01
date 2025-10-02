"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { RefreshCwIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { showError } from "@/app/utils/toast";

function RedisStatus() {
  const { user } = useAuth();
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsActive(user?.redisStatus || false);
  }, [user]);

  const refetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/redis?action=refetchStatus");
      const data = await res.json();
      if (!data.success) {
        showError(data.message || "Failed to fetch Redis status");
      }
      setIsActive(data.active || false);
    } catch (err) {
      console.error("Refetch error:", err);
      showError("Failed to fetch Redis status");
    } finally {
      setLoading(false);
    }
  };

  const retryConnection = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to retry Redis connection?"
    );
    if (!confirmed) return;
    setLoading(true);
    try {
      const res = await fetch("/api/redis?action=retry");
      const data = await res.json();
      if (!data.success) {
        showError(data.message || "Failed to retry Redis connection");
      }
      setIsActive(data.active || false);
    } catch (err) {
      console.error("Retry error:", err);
      showError("Failed to retry Redis connection");
    } finally {
      setLoading(false);
    }
  };

  const disconnect = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to disconnect Redis?"
    );
    if (!confirmed) return;

    const signature = window.prompt('Type "STOP" to confirm disconnect:');
    if (signature !== "STOP") {
      showError("You must type STOP to confirm disconnect");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/redis?action=disconnect");
      const data = await res.json();
      if (!data.success) {
        showError(data.message || "Failed to disconnect Redis");
      }
      setIsActive(data.active || false);
    } catch (err) {
      console.error("Disconnect error:", err);
      showError("Failed to disconnect Redis");
    } finally {
      setLoading(false);
    }
  };

  if (!user || user?.role !== "admin") return <></>;
  return (
    <div>
      <Popover>
        <PopoverTrigger asChild>
          <div className="flex items-center gap-2 text-xs border border-muted/50 p-1 rounded-lg font-semibold cursor-pointer w-fit">
            {/* Status Dot */}
            <span
              className={`h-3 w-3 rounded-full ${
                isActive ? "bg-green-500" : "bg-red-500"
              }`}
            ></span>
            <span className="text-sm font-medium">Redis</span>

            <RefreshCwIcon
              onClick={(e) => {
                if (loading) return;
                e.stopPropagation();
                refetchStatus();
              }}
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
          </div>
        </PopoverTrigger>

        {/* Floating Panel */}
        <PopoverContent className="w-56">
          <div className="flex flex-col gap-2">
            <Button
              onClick={retryConnection}
              disabled={isActive || loading}
              variant="default"
            >
              Retry Connection
            </Button>

            <Separator />

            <Button
              onClick={disconnect}
              disabled={loading}
              variant="destructive"
            >
              Disconnect
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default RedisStatus;
