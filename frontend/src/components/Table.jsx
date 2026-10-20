import React from "react";

export default function Table({ headers, data, keys, emptyMessage = "No records found" }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200/90 shadow-sm bg-white">
      <table className="w-full text-left text-xs sm:text-sm">
        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-semibold tracking-wider">
          <tr>
            {headers.map((header) => (
              <th key={header} className="py-3 px-4">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.length ? (
            data.map((row, idx) => (
              <tr
                key={row.id || idx}
                className="hover:bg-slate-50/70 transition-colors"
              >
                {keys.map((key) => (
                  <td key={key} className="py-3 px-4 text-slate-700">
                    {row[key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={headers.length}
                className="py-8 text-center text-slate-400 font-medium"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
