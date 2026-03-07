import { useCallback, useEffect, useState } from "react";
import { getBeds, getHospitals } from "../api/client";

export const useHospitalData = () => {
  const [state, setState] = useState({
    hospitals: [],
    beds: [],
    loading: true,
    error: "",
  });

  const loadData = useCallback(async () => {
    try {
      const [hospitals, beds] = await Promise.all([getHospitals(), getBeds()]);
      setState((prev) => ({
        ...prev,
        hospitals,
        beds,
        loading: false,
        error: "",
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err?.message || "Failed to load data",
      }));
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    ...state,
    refreshData: loadData,
  };
};
