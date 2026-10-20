import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Package, ShieldCheck } from "lucide-react";

export default function FoodItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFoodItems();
  }, []);

  const fetchFoodItems = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("Food Items")
        .select("*");

      if (error) {
        console.error("Error fetching Food Items:", error.message);
      } else {
        setItems(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Food Items Registry</h1>
          <p className="text-xs text-slate-500 mt-0.5">Verified produce tracked on the farmTrace ledger</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Active Ledger</span>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200/90 shadow-sm bg-white">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-semibold tracking-wider">
            <tr>
              <th className="py-3.5 px-4">Item ID</th>
              <th className="py-3.5 px-4">Produce Name</th>
              <th className="py-3.5 px-4">Origin / Farm</th>
              <th className="py-3.5 px-4">Verification Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-400">Loading catalog...</td>
              </tr>
            ) : items.length ? (
              items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-500">{item.id}</td>
                  <td className="py-3.5 px-4 font-medium text-slate-800">{item.name}</td>
                  <td className="py-3.5 px-4 text-slate-600">{item.origin}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                      {item.status || "Verified"}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-400 font-medium">
                  No registered produce items found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
