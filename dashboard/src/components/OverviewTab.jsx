import React, { useState } from 'react';
import { MapPin, AlertTriangle, TrendingUp, Users, Database } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, ScatterChart, Scatter, ZAxis } from 'recharts';
import KPI_Card from '../components/KPI_Card';
import ProvinceAnalysis from '../components/ProvinceAnalysis';
import { getPartyColor } from '../constants/partyColors';

function OverviewTab({ data, kpis, seatDistributionData, topDiscrepancyData, scatterData, sortedTableData, provinceSummary, provinceAnalysisData, selectedRegion, setSelectedRegion }) {
  const [tableFilter, setTableFilter] = useState('all');
  
  if (!kpis) return null;

  const filteredTableData = sortedTableData.filter(row => {
    if (tableFilter === 'all') return true;
    if (tableFilter === 'constituencyGreater') return row.discrepancy > 0;
    if (tableFilter === 'partyListGreater') return row.discrepancy < 0;
    if (tableFilter === 'noDiscrepancy') return row.discrepancy === 0;
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300" role="tabpanel" id="overview-panel" aria-labelledby="overview-tab">
      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPI_Card 
          title="เขตเลือกตั้งทั้งหมด" 
          value={kpis.totalDistricts.toLocaleString()} 
          icon={<MapPin className="w-6 h-6 text-slate-600" />} 
          subtitle="เขต"
        />
        <KPI_Card 
          title="ยอดเขย่งสัมบูรณ์รวม" 
          value={kpis.totalDiscrepancy.toLocaleString()} 
          icon={<AlertTriangle className="w-6 h-6 text-orange-500" />} 
          subtitle="ใบ"
          trend="ผลรวมของผลต่างสัมบูรณ์"
        />
        <KPI_Card 
          title="เขตที่มียอดเขย่งสูงสุด" 
          value={`${kpis.maxDiscrepancyDistrict.province} เขต ${kpis.maxDiscrepancyDistrict.district}`} 
          icon={<TrendingUp className="w-6 h-6 text-red-500" />} 
          subtitle={`ต่างกัน ${kpis.maxDiscrepancyDistrict.absDiscrepancy.toLocaleString()} ใบ`}
        />
        <KPI_Card 
          title="พรรคชนะ ส.ส. เขต มากที่สุด" 
          value={kpis.topConstituencyParty[0]} 
          icon={<Users className="w-6 h-6" style={{color: getPartyColor(kpis.topConstituencyParty[0])}} />} 
          subtitle={`${kpis.topConstituencyParty[1]} เขต`}
        />
        <KPI_Card 
          title="พรรคชนะปาร์ตี้ลิสต์มากที่สุด" 
          value={kpis.topPartyListParty[0]} 
          icon={<Users className="w-6 h-6" style={{color: getPartyColor(kpis.topPartyListParty[0])}} />} 
          subtitle={`${kpis.topPartyListParty[1]} เขต`}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Seat Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">จำนวนที่นั่ง ส.ส. เขต แยกตามพรรค</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={seatDistributionData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                <RechartsTooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="value" name="จำนวนที่นั่ง (เขต)" radius={[0, 4, 4, 0]}>
                  {seatDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getPartyColor(entry.name)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Discrepancy */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-1">15 เขตที่มียอดเขย่งสูงสุด</h3>
          <p className="text-sm text-slate-500 mb-4">สีแดง: บัตรเขต &gt; ปาร์ตี้ลิสต์ | สีน้ำเงิน: ปาร์ตี้ลิสต์ &gt; บัตรเขต</p>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topDiscrepancyData} margin={{ top: 5, right: 30, left: 20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} tick={{fontSize: 10}} interval={0} />
                <YAxis />
                <RechartsTooltip 
                  formatter={(value, name, props) => {
                    const isPositive = props.payload.discrepancy > 0;
                    return [`${Math.abs(value).toLocaleString()} ใบ (${isPositive ? 'เขต > บัญชี' : 'บัญชี > เขต'})`, 'ผลต่าง'];
                  }}
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="discrepancy" name="ยอดเขย่ง" radius={[4, 4, 0, 0]}>
                  {topDiscrepancyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Scatter Plot */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 lg:col-span-2">
          <h3 className="text-lg font-semibold text-slate-800 mb-1">ความสัมพันธ์ระหว่างผู้มาใช้สิทธิ์ ส.ส. เขต และ บัญชีรายชื่อ</h3>
          <p className="text-sm text-slate-500 mb-4">จุดที่อยู่ห่างจากเส้นทแยงมุมคือเขตที่มียอดเขย่งสูง (ขนาดจุดแปรผันตามยอดเขย่ง)</p>
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" dataKey="x" name="ผู้ใช้สิทธิ์ เขต" domain={['auto', 'auto']} tickFormatter={(v) => v.toLocaleString()} />
                <YAxis type="number" dataKey="y" name="ผู้ใช้สิทธิ์ บัญชีรายชื่อ" domain={['auto', 'auto']} tickFormatter={(v) => v.toLocaleString()} />
                <ZAxis type="number" dataKey="discrepancy" range={[20, 400]} name="ยอดเขย่งสัมบูรณ์" />
                <RechartsTooltip 
                  cursor={{ strokeDasharray: '3 3' }} 
                  formatter={(value, name) => [value.toLocaleString(), name]}
                  labelFormatter={() => ''}
                  content={({ payload }) => {
                    if (payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 rounded-lg shadow-md border border-slate-100 text-sm">
                          <p className="font-semibold text-slate-800 mb-1">{data.name}</p>
                          <p className="text-slate-600">บัตรเขต: {data.x.toLocaleString()}</p>
                          <p className="text-slate-600">บัญชีรายชื่อ: {data.y.toLocaleString()}</p>
                          <p className="text-orange-600 font-medium mt-1">ยอดเขย่ง: {data.discrepancy.toLocaleString()}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="เขตเลือกตั้ง" data={scatterData} fill="#8884d8" opacity={0.6}>
                  {scatterData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.discrepancy > 1000 ? '#ef4444' : (entry.discrepancy > 100 ? '#f59e0b' : '#3b82f6')} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">ข้อมูลรายเขต (เรียงตามยอดเขย่งสูงสุด)</h3>
            <span className="text-sm text-slate-500">แสดง {filteredTableData.length} จาก {sortedTableData.length} เขต</span>
          </div>
          
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setTableFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                tableFilter === 'all'
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ทั้งหมด
            </button>
            <button
              onClick={() => setTableFilter('constituencyGreater')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 ${
                tableFilter === 'constituencyGreater'
                  ? 'bg-red-100 text-red-700 border border-red-300'
                  : 'bg-red-50 text-red-600 hover:bg-red-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              ส.ส. เขต &gt; บัญชีรายชื่อ
            </button>
            <button
              onClick={() => setTableFilter('partyListGreater')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 ${
                tableFilter === 'partyListGreater'
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              บัญชีรายชื่อ &gt; ส.ส. เขต
            </button>
            <button
              onClick={() => setTableFilter('noDiscrepancy')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 ${
                tableFilter === 'noDiscrepancy'
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : 'bg-green-50 text-green-600 hover:bg-green-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              สมบูรณ์ ไม่มีเขย่ง
            </button>
          </div>
        </div>
        <div className="overflow-x-auto max-h-[600px]">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 border-b">จังหวัด</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 border-b">เขต</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 border-b text-right">บัตร ส.ส. เขต</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 border-b text-right">บัตรบัญชีรายชื่อ</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 border-b text-right">ยอดเขย่ง (ผลต่าง)</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 border-b">พรรคที่ชนะ (เขต)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTableData.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-3 text-sm text-slate-800 font-medium">{row.province}</td>
                  <td className="px-6 py-3 text-sm text-slate-600">{row.district}</td>
                  <td className="px-6 py-3 text-sm text-slate-600 text-right">{row.constituencyVoters.toLocaleString()}</td>
                  <td className="px-6 py-3 text-sm text-slate-600 text-right">{row.partyListVoters.toLocaleString()}</td>
                  <td className="px-6 py-3 text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${row.absDiscrepancy > 1000 ? 'bg-red-100 text-red-800' : 
                        row.absDiscrepancy > 100 ? 'bg-orange-100 text-orange-800' : 
                        row.absDiscrepancy === 0 ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}
                    >
                      {row.discrepancy > 0 ? '+' : ''}{row.discrepancy.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span 
                        className="w-2.5 h-2.5 rounded-full" 
                        style={{ backgroundColor: getPartyColor(row.winningConstituencyParty) }}
                      ></span>
                      <span className="text-slate-700">{row.winningConstituencyParty}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Province Analysis Section */}
      <ProvinceAnalysis 
        provinceAnalysisData={provinceAnalysisData} 
        selectedRegion={selectedRegion}
        setSelectedRegion={setSelectedRegion}
      />
    </div>
  );
}

export default OverviewTab;
