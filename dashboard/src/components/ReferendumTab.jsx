import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

function ReferendumTab({ turnoutComparisonData }) {
  const [showAll, setShowAll] = useState(false);
  
  const displayData = showAll 
    ? turnoutComparisonData 
    : turnoutComparisonData.slice(0, 20);
  
  const hasMore = turnoutComparisonData.length > 20;

  return (
    <div className="space-y-6 animate-in fade-in duration-300" role="tabpanel" id="referendum-panel" aria-labelledby="referendum-tab">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-800 mb-1">เปรียบเทียบผู้มาใช้สิทธิ์ (เลือกตั้ง vs ประชามติ)</h3>
        <p className="text-sm text-slate-500 mb-4">
          ตารางแสดงเขตเลือกตั้งที่มีส่วนต่างผู้มาใช้สิทธิ์ ส.ส. เขต มากกว่า ประชามติ 
          {showAll ? '(แสดงทั้งหมด)' : 'สูงที่สุด 20 อันดับ'}
          <span className="text-slate-400 ml-2">({turnoutComparisonData.length} เขต)</span>
        </p>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 sticky top-0">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 border-b">เขตเลือกตั้ง</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 border-b text-right">ผู้มาใช้สิทธิ์ เลือกตั้งเขต</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 border-b text-right">ผู้มาใช้สิทธิ์ ประชามติ</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 border-b text-right">ส่วนต่าง (บัตรผี?)</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 border-b text-right">% ความต่าง</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayData.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="px-6 py-3 text-sm text-slate-800 font-medium">{row.province} เขต {row.district}</td>
                  <td className="px-6 py-3 text-sm text-slate-600 text-right">{(row.constituencyVoters || 0).toLocaleString()}</td>
                  <td className="px-6 py-3 text-sm text-slate-600 text-right">{(row.referendumTurnout || 0).toLocaleString()}</td>
                  <td className="px-6 py-3 text-sm font-bold text-orange-600 text-right">
                    {(row.turnoutDifference || 0) > 0 ? '+' : ''}{(row.turnoutDifference || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-3 text-sm text-slate-500 text-right">
                    {(row.turnoutDiffPercentage || 0) > 0 ? '+' : ''}{(row.turnoutDiffPercentage || 0).toFixed(2)}%
                  </td>
                </tr>
              ))}
              {turnoutComparisonData.length === 0 && (
                 <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                    ไม่พบข้อมูล หรือข้อมูลผู้มาใช้สิทธิ์ตรงกัน
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Toggle Button */}
        {hasMore && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => setShowAll(!showAll)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              {showAll ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  แสดงแค่ 20 อันดับแรก
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  ดูทั้งหมด ({turnoutComparisonData.length} เขต)
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReferendumTab;
