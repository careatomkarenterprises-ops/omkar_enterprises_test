import React, { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function App() {
  const [showConsentPopup, setShowConsentPopup] = useState(true);
  const [consentName, setConsentName] = useState("");
  const [consentPhone, setConsentPhone] = useState("");
  const [investorData, setInvestorData] = useState(null);

  const samplePerformance = [
    { month: "Jan", value: 120000 },
    { month: "Feb", value: 125000 },
    { month: "Mar", value: 118000 },
    { month: "Apr", value: 130000 },
    { month: "May", value: 140000 },
    { month: "Jun", value: 135000 },
    { month: "Jul", value: 150000 },
    { month: "Aug", value: 155000 },
    { month: "Sep", value: 160000 }
  ];

  const demoPositions = [
    { id: "L-001", amount: 50000, since: "11-Sep-2025", status: "Active", nextPayout: "12-Oct-2025" },
    { id: "L-002", amount: 100000, since: "01-Jan-2025", status: "Matured", nextPayout: "--" }
  ];

  function exportPositionsCSV() {
    if (!investorData) return;
    const headers = ["Loan ID", "Amount", "Since", "Status", "Next Payout"];
    const rows = investorData.positions.map(p => [p.id, p.amount, p.since, p.status, p.nextPayout]);
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "positions.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="max-w-6xl mx-auto mb-6">
        <h1 className="text-2xl font-bold">Omkar Enterprises — Investor Relations</h1>
        <p className="text-sm text-gray-600">Private investor portal • Confidential & Contractual</p>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 bg-white p-4 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-4">Portfolio Overview</h2>

          {!investorData ? (
            <button
              className="px-4 py-2 bg-indigo-600 text-white rounded"
              onClick={() =>
                setInvestorData({
                  name: "Demo Investor",
                  mobile: "+91-98XXXXXXX",
                  positions: demoPositions,
                  performance: samplePerformance
                })
              }
            >
              Load Demo Data
            </button>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-xl font-bold">{investorData.name}</h3>
                  <p className="text-sm text-gray-500">{investorData.mobile}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm">Total Invested</p>
                  <p className="text-xl font-semibold">
                    ₹{investorData.positions.reduce((s, p) => s + p.amount, 0)}
                  </p>
                </div>
              </div>

              <div style={{ height: 280 }} className="mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={investorData.performance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <h4 className="font-medium mb-2">Active Positions</h4>
              <table className="w-full text-sm border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 border">Loan ID</th>
                    <th className="p-2 border">Amount</th>
                    <th className="p-2 border">Since</th>
                    <th className="p-2 border">Status</th>
                    <th className="p-2 border">Next Payout</th>
                  </tr>
                </thead>
                <tbody>
                  {investorData.positions.map(pos => (
                    <tr key={pos.id}>
                      <td className="p-2 border">{pos.id}</td>
                      <td className="p-2 border">₹{pos.amount}</td>
                      <td className="p-2 border">{pos.since}</td>
                      <td className="p-2 border">{pos.status}</td>
                      <td className="p-2 border">{pos.nextPayout}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={exportPositionsCSV}
                  className="px-4 py-2 bg-indigo-600 text-white rounded"
                >
                  Export Positions (CSV)
                </button>
              </div>
            </>
          )}
        </section>

        <aside className="bg-white p-4 rounded-xl shadow">
          <h3 className="font-semibold mb-2">Safety & Compliance</h3>
          <p className="text-sm text-gray-500">
            Omkar Enterprises is a private consultancy. We do not accept public deposits. All dealings are private contracts.
          </p>
        </aside>
      </main>

      {showConsentPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="bg-white rounded-xl p-6 w-11/12 max-w-md">
            <h2 className="text-lg font-semibold mb-3">Consent Required</h2>
            <p className="text-sm mb-4">
              By proceeding, you acknowledge this is a private and contractual discussion only.
            </p>
            <form
              onSubmit={e => {
                e.preventDefault();
                setShowConsentPopup(false);
              }}
              className="grid gap-2"
            >
              <input
                className="border p-2 rounded"
                placeholder="Full Name"
                value={consentName}
                onChange={e => setConsentName(e.target.value)}
                required
              />
              <input
                className="border p-2 rounded"
                placeholder="Contact Number"
                value={consentPhone}
                onChange={e => setConsentPhone(e.target.value)}
                required
              />
              <div className="flex items-center gap-2">
                <input id="agree" type="checkbox" className="w-4 h-4" required />
                <label htmlFor="agree" className="text-sm">I consent to proceed.</label>
              </div>
              <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">
                Proceed
              </button>
            </form>
          </div>
        </div>
      )}

      <footer className="max-w-6xl mx-auto text-center py-6 text-sm text-gray-500">
        © Omkar Enterprises — Private & Confidential. Not a bank or NBFC. All investment arrangements are private contracts,
        not public deposits, compliant with Companies Act, 2013 and BUDS Act, 2019.
      </footer>
    </div>
  );
}
