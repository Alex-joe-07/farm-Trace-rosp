import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Users as UsersIcon } from "lucide-react";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Check either "users" or "Users"
      const { data, error } = await supabase.from("users").select("*");
      if (error) {
        const fallback = await supabase.from("Users").select("*");
        if (fallback.error) console.error("Error fetching Users:", fallback.error.message);
        else setUsers(fallback.data || []);
      } else {
        setUsers(data || []);
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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Network Participants</h1>
          <p className="text-xs text-slate-500 mt-0.5">Verified farmers, logistics operators, retailers, and node members</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
          <UsersIcon className="w-3.5 h-3.5 text-slate-500" />
          <span>{users.length} Registered</span>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200/90 shadow-sm bg-white">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-semibold tracking-wider">
            <tr>
              <th className="py-3.5 px-4">Node ID</th>
              <th className="py-3.5 px-4">Member Name</th>
              <th className="py-3.5 px-4">Email</th>
              <th className="py-3.5 px-4">Role</th>
              <th className="py-3.5 px-4">Organization / Location</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">Loading directory...</td>
              </tr>
            ) : users.length ? (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-400">{u.id?.slice(0, 8)}...</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{u.name || "Participant"}</td>
                  <td className="py-3.5 px-4 text-slate-600">{u.email}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                      {u.role || "Member"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 text-xs">
                    {u.business_name || u.location || "Verified Node"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                  No registered network participants found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
