import { useState, useEffect, useRef } from "react";
import { subscribeSalesQuery } from "./firestore";

/**
 * Custom hook for querying salesRecords with server-side filters.
 * Automatically re-subscribes when filter parameters change.
 *
 * @param {Object} params
 * @param {string} [params.startDate] - YYYY-MM-DD
 * @param {string} [params.endDate] - YYYY-MM-DD
 * @param {string} [params.store] - reportStore filter
 * @param {number} [params.limitCount] - max docs to fetch
 * @param {boolean} [params.enabled=true] - skip subscription when false
 * @returns {{ data: Array, loading: boolean }}
 */
export function useSalesQuery({ startDate, endDate, store, limitCount, enabled = true } = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const firstLoad = useRef(true);

  useEffect(() => {
    if (!enabled) { setData([]); setLoading(false); return; }

    setLoading(true);
    firstLoad.current = true;

    const filters = {};
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    if (store) filters.store = store;
    if (limitCount) filters.limitCount = limitCount;

    const unsub = subscribeSalesQuery(filters, (results) => {
      setData(results);
      if (firstLoad.current) { setLoading(false); firstLoad.current = false; }
    });

    return unsub;
  }, [startDate, endDate, store, limitCount, enabled]);

  return { data, loading };
}
