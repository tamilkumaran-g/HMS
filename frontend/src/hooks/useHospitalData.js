import { useEffect, useState } from "react";
import { getBeds, getHospitals } from "../api/client";

export const useHospitalData = (pollMs = 5000) => {
  const [state, setState] = useState({
    hospitals: [],
    beds: [],
    loading: true,
    error: "",
  });

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const [hospitals, beds] = await Promise.all([
          getHospitals(),
          getBeds(),
        ]);
        if (isMounted) {
          setState({ hospitals, beds, loading: false, error: "" });
        }
      } catch (err) {
        if (isMounted) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: err?.message || "Failed to load data",
          }));
        }
      }
    };

    // Load data once on mount only - NO auto-refresh
    load();
    // Disabled auto-refresh to prevent seat allocation form from disappearing
    // const intervalId = setInterval(load, pollMs);

    return () => {
      isMounted = false;
      // clearInterval(intervalId);
    };
  }, [pollMs]);

  return state;
};
