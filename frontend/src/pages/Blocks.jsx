import React from "react";
import { Blocks as BlocksIcon, ShieldCheck } from "lucide-react";

export default function Blocks() {
  const blocks = [
    { id: 1, hash: "0x8f4c...b921", prevHash: "0x0000...0000", timestamp: "2026-10-18 09:30" },
    { id: 2, hash: "0x3a7e...e409", prevHash: "0x8f4c...b921", timestamp: "2026-10-19 14:15" },
    { id: 3, hash: "0x91d2...fc88", prevHash: "0x3a7e...e409", timestamp: "2026-10-20 11:45" },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Ledger Blocks</h1>
          <p className="text-xs text-slate-500 mt-0.5">Cryptographic transaction blocks securing supply chain checkpoints</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Consensus Verified</span>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200/90 shadow-sm bg-white">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-semibold tracking-wider">
            <tr>
              <th className="py-3.5 px-4">Block Height</th>
              <th className="py-3.5 px-4">Current Hash</th>
              <th className="py-3.5 px-4">Previous Hash</th>
              <th className="py-3.5 px-4">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {blocks.map((block) => (
              <tr key={block.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3.5 px-4 font-mono font-bold text-slate-700">#{block.id}</td>
                <td className="py-3.5 px-4 font-mono text-xs text-emerald-700 bg-emerald-50/30 px-2 py-1 rounded w-fit">{block.hash}</td>
                <td className="py-3.5 px-4 font-mono text-xs text-slate-400">{block.prevHash}</td>
                <td className="py-3.5 px-4 text-slate-500 text-xs">{block.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
