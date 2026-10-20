import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { motion } from "framer-motion";
import { Route, Clock, CheckCircle2, Shield } from "lucide-react";

export default function FoodJourney() {
  const [journeyData, setJourneyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchJourney();
  }, []);

  const fetchJourney = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.from("Food Journey").select("*");
      if (error) throw new Error(error.message);
      setJourneyData(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-sm font-semibold text-slate-700">Loading audit trail...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          Error loading journey: {error}
        </div>
      </div>
    );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Food Journey Logs</h1>
          <p className="text-xs text-slate-500 mt-0.5">Immutable transit checkpoints recorded across nodes</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
          <Route className="w-3.5 h-3.5 text-slate-500" />
          <span>{journeyData.length} Checkpoints</span>
        </div>
      </div>

      {journeyData.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 shadow-sm text-slate-400 text-sm">
          No food journey checkpoints registered yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {journeyData.map((item, idx) => (
            <motion.div
              key={item.id || idx}
              className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-200 space-y-3"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">ID: {item.id}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                  {item.status || "Completed"}
                </span>
              </div>

              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Checkpoint</p>
                <p className="text-base font-bold text-slate-800">{item.checkpoint || "Node Checkpoint"}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
                <span className="font-mono">Item: {item.food_item_id}</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {item.timestamp ? new Date(item.timestamp).toLocaleDateString() : "Just now"}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
