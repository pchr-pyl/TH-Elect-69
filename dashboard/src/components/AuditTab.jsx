import React from 'react';
import { AlertTriangle, XCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Line, ComposedChart, Legend } from 'recharts';

function AuditTab({ criticalDistrictsData, invalidBallotsChartData }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300" role="tabpanel" id="audit-panel" aria-labelledby="audit-tab">
      {/* Critical Alerts */}
      {criticalDistrictsData.length > 0 && (
        <div className="bg-red-50 p-6 rounded-xl shadow-sm border border-red-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-red-100 p-2 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-red-900">Critical Alerts: ยอดเขย่งมากกว่าคะแนนที่ชนะ (Margin of Victory)</h2>
              <p className="text-red-700 text-sm">พบ {criticalDistrictsData.length} เขตเลือกตั้งที่ "ยอดเขย่ง" อาจมีผลต่อการเปลี่ยนแปลงผู้ชนะ</p>
            </div>
          </div>
          
          <div className="overflow-x-auto bg-white rounded-lg border border-red-100">
            <table className="w-full text-left border-collapse">
              <thead className="bg-red-50/50">
                <tr>
                  <th className="px-4 py-3 text-sm font-semibold text-red-800 border-b">เขตเลือกตั้ง</th>
                  <th className="px-4 py-3 text-sm font-semibold text-red-800 border-b text-right">ยอดเขย่งสัมบูรณ์</th>
                  <th className="px-4 py-3 text-sm font-semibold text-red-800 border-b text-right">ส่วนต่างคะแนนผู้ชนะ (ที่ 1 - ที่ 2)</th>
                  <th className="px-4 py-3 text-sm font-semibold text-red-800 border-b">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-100">
                {criticalDistrictsData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-red-50/30">
                    <td className="px-4 py-3 text-sm font-medium text-slate-800">{row.province} เขต {row.district}</td>
                    <td className="px-4 py-3 text-sm font-bold text-red-600 text-right">{(row.absDiscrepancy || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 text-right">{(row.marginOfVictory || row.constituencyMargin || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-red-600 font-medium flex items-center gap-1">
                      <XCircle className="w-4 h-4" /> อาจมีผลพลิกผลเลือกตั้ง
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invalid Ballots Correlation */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-800 mb-1">ความสัมพันธ์ระหว่าง ยอดเขย่ง และ เปอร์เซ็นต์บัตรเสีย/ไม่เลือกผู้ใด</h3>
        <p className="text-sm text-slate-500 mb-4">แสดงผล 50 เขตที่มียอดเขย่งสูงสุด เพื่อตรวจสอบความผิดปกติของบัตรเสีย (หากแท่งคู่กันสูงผิดปกติ อาจเป็นสัญญาณบ่งชี้)</p>
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={invalidBallotsChartData} margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} tick={{fontSize: 10}} interval={0} />
              <YAxis yAxisId="left" orientation="left" stroke="#ef4444" name="ยอดเขย่ง" />
              <YAxis yAxisId="right" orientation="right" stroke="#64748b" name="% บัตรเสียรวม" />
              <RechartsTooltip 
                contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                formatter={(value, name) => {
                  if (name === "ยอดเขย่ง") return [value.toLocaleString(), "ยอดเขย่งสัมบูรณ์ (ใบ)"];
                  if (name === "invalidPercentage") return [`${value}%`, "บัตรเสีย + โหวตโน (%)"];
                  return [value, name];
                }}
              />
              <Legend wrapperStyle={{paddingTop: '20px'}} />
              <Bar yAxisId="left" dataKey="discrepancy" name="ยอดเขย่ง" fill="#ef4444" opacity={0.8} />
              <Line yAxisId="right" type="monotone" dataKey="invalidPercentage" name="% บัตรเสียรวม" stroke="#475569" strokeWidth={2} dot={{r: 3}} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default AuditTab;
