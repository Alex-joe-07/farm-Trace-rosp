import React from "react";

export default function Checkpoints() {
  const checkpoints = [
    { id: 1, location: "Farm", status: "Completed", timestamp: "2025-10-04 10:00" },
    { id: 2, location: "Processing Plant", status: "Completed", timestamp: "2025-10-04 11:30" },
    { id: 3, location: "Logistics Hub", status: "In Transit", timestamp: "2025-10-04 14:00" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Supply Chain Checkpoints</h1>
      <table className="w-full border border-gray-300 rounded-lg shadow-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left">Checkpoint #</th>
            <th className="p-3 text-left">Location</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {checkpoints.map((cp) => (
            <tr key={cp.id} className="border-t">
              <td className="p-3">{cp.id}</td>
              <td className="p-3">{cp.location}</td>
              <td className="p-3">{cp.status}</td>
              <td className="p-3">{cp.timestamp}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
