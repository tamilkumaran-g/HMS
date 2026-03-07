import React, { useEffect, useMemo, useState } from "react";
import { Activity, Building2, BedDouble, AlertCircle } from "lucide-react";
import { BACKEND_URL } from "../api/client";

const LiveStatus = () => {
  const [status, setStatus] = useState({
    connected: false,
    hospitals: 0,
    beds: 0,
    timestamp: "",
  });

  const wsUrl = useMemo(() => {
    try {
      const url = new URL(BACKEND_URL);
      url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
      url.pathname = "/ws";
      url.search = "";
      url.hash = "";
      return url.toString();
    } catch {
      return "ws://localhost:8000/ws";
    }
  }, []);

  useEffect(() => {
    // WebSocket disabled to prevent auto-refresh during bed allocation
    return;
    
    /* DISABLED WebSocket connection
    console.log("Attempting WebSocket connection to:", wsUrl);
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log("✅ WebSocket connected!");
      setStatus((prev) => ({ ...prev, connected: true }));
    };

    socket.onclose = (event) => {
      console.log("❌ WebSocket disconnected:", event.code, event.reason);
      setStatus((prev) => ({ ...prev, connected: false }));
    };

    socket.onerror = (error) => {
      console.error("❌ WebSocket error:", error);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("📩 WebSocket message received:", data);
        setStatus({
          connected: true,
          hospitals: data.hospitals?.length || 0,
          beds: data.beds?.length || 0,
          timestamp: data.timestamp || "",
        });
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
        setStatus((prev) => ({ ...prev, connected: true }));
      }
    };

    return () => {
      console.log("Closing WebSocket connection");
      socket.close();
    };
    */
  }, [wsUrl]);

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <Activity className="w-5 h-5" /> Live Updates
      </h2>
      <div className="flex items-center gap-2 mt-2">
        <div
          className={`w-3 h-3 rounded-full ${
            status.connected ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
          }`}
        />
        <p className="text-sm text-slate-300">
          WebSocket {status.connected ? "connected" : "disconnected"}
        </p>
      </div>
      <div className="mt-4 rounded-2xl bg-white/10 px-4 py-3 text-sm space-y-2">
        <p className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-blue-400" />
          <span>
            Hospitals: <span className="font-semibold">{status.hospitals}</span>
          </span>
        </p>
        <p className="flex items-center gap-2">
          <BedDouble className="w-4 h-4 text-emerald-400" />
          <span>
            Beds: <span className="font-semibold">{status.beds}</span>
          </span>
        </p>
        <p className="text-xs text-slate-300">
          Last update:{" "}
          {status.timestamp
            ? new Date(status.timestamp).toLocaleTimeString()
            : "--"}
        </p>
      </div>
      {!status.connected && (
        <div className="mt-3 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>
            Cannot connect to server. Check if backend is running on port 8000.
          </span>
        </div>
      )}
    </section>
  );
};

export default LiveStatus;
