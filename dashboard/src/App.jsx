import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, 
  ScatterChart, Scatter, ZAxis, Cell, ComposedChart, Line
} from 'recharts';
import { Users, TrendingUp, AlertTriangle, MapPin, Database, CheckSquare, XCircle, LayoutDashboard, Search } from 'lucide-react';

const PARTY_COLORS = {
  'ประชาชน': '#f47521', // Orange
  'เพื่อไทย': '#da3731', // Red
  'ภูมิใจไทย': '#203978', // Blue
  'พลังประชารัฐ': '#1f4888', // Dark Blue
  'รวมไทยสร้างชาติ': '#1e3868', // Deep Blue
  'ประชาธิปัตย์': '#00a3e8', // Light Blue
  'ชาติไทยพัฒนา': '#ff9eb5', // Pink
  'ประชาชาติ': '#a8784d', // Brown
  'ไทยสร้างไทย': '#005baa', // Blue
  'ชาติพัฒนากล้า': '#f19e38', // Orange/Yellow
  'เสรีรวมไทย': '#eed341', // Yellow
  'เป็นธรรม': '#0097a8', // Teal
  'Other': '#94a3b8' // Gray
};

const getPartyColor = (partyName) => PARTY_COLORS[partyName] || PARTY_COLORS['Other'];

function App() {
  const [data, setData] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to process raw JSON data
  const processData = (plotData, constituencyData, referendumData) => {
    // Create lookup maps for faster joining
    const constituencyMap = new Map(constituencyData.map(row => [`${String(row['จังหวัด']).trim()}-${row['เขตเลือกตั้งที่']}`, row]));
    const referendumMap = new Map(referendumData.map(row => [`${String(row['จังหวัด']).trim()}-${row['เขตเลือกตั้งที่']}`, row]));

    return plotData
      .filter(row => row['จังหวัด'] && row['เขตเลือกตั้งที่']) // Filter out empty or summary rows
      .map(row => {
        // Handle both string with commas and raw numbers
        const getNum = (val) => {
          if (typeof val === 'number') return val;
          if (typeof val === 'string') return parseInt(val.replace(/,/g, '')) || 0;
          return 0;
        };

        const province = String(row['จังหวัด']).trim();
        const district = parseInt(row['เขตเลือกตั้งที่']);
        const key = `${province}-${district}`;

        const constituencyVoters = getNum(row['ผู้มาใช้สิทธิ์ ส.ส. เขต']);
        const partyListVoters = getNum(row['ผู้มาใช้สิทธิ์ บัญชีรายชื่อ']);
        const discrepancy = getNum(row['ผลต่าง บัตร']) || (constituencyVoters - partyListVoters);
        const marginOfVictory = getNum(row['ผลต่าง เขต ที่ 1 - ที่ 2']);
        
        // Join with constituency data
        const constRow = constituencyMap.get(key) || {};
        const invalidBallots = getNum(constRow['บัตรเสีย']);
        const voteNo = getNum(constRow['บัตรไม่เลือกผู้ใด']);
        const invalidPercentage = constituencyVoters > 0 ? ((invalidBallots + voteNo) / constituencyVoters) * 100 : 0;

        // Join with referendum data
        const refRow = referendumMap.get(key) || {};
        const referendumTurnout = getNum(refRow['ผู้มาใช้สิทธิ์']);
        const turnoutDifference = constituencyVoters - referendumTurnout;
        
        return {
          province,
          district,
          constituencyVoters,
          partyListVoters,
          discrepancy,
          absDiscrepancy: Math.abs(discrepancy),
          marginOfVictory,
          isCritical: Math.abs(discrepancy) > marginOfVictory,
          winningConstituencyParty: String(row['พรรคชนะ ส.ส. เขต'] || 'Unknown').trim(),
          winningPartyListParty: String(row['พรรคชนะ บัญชีรายชือ'] || 'Unknown').trim(),
          invalidBallots,
          voteNo,
          invalidPercentage,
          referendumTurnout,
          turnoutDifference,
          turnoutDiffPercentage: referendumTurnout > 0 ? (turnoutDifference / referendumTurnout) * 100 : 0
        };
      });
  };

  useEffect(() => {
    Promise.all([
      fetch('/plot.json').then(res => res.json()),
      fetch('/constituency.json').then(res => res.json()).catch(() => []), // Optional
      fetch('/referendum.json').then(res => res.json()).catch(() => [])  // Optional
    ])
    .then(([plotData, constituencyData, referendumData]) => {
      if (plotData && plotData.length > 0) {
        setData(processData(plotData, constituencyData, referendumData));
        setIsLoading(false);
      } else {
        throw new Error('No data found in plot.json');
      }
    })
    .catch(err => {
      console.error('Error loading data:', err);
      setError('ไม่สามารถโหลดข้อมูลได้ โปรดตรวจสอบว่ามีไฟล์ JSON อยู่ในโฟลเดอร์ public');
      setIsLoading(false);
    });
  }, []);

  // --- Derived Data / KPIs ---
  const kpis = useMemo(() => {
    if (data.length === 0) return null;

    let totalDiscrepancy = 0;
    let maxDiscrepancyDistrict = data[0];
    const constituencyWins = {};
    const partyListWins = {};
    let criticalCount = 0;

    data.forEach(row => {
      totalDiscrepancy += row.absDiscrepancy;
      
      if (row.absDiscrepancy > maxDiscrepancyDistrict.absDiscrepancy) {
        maxDiscrepancyDistrict = row;
      }

      if (row.isCritical) {
        criticalCount++;
      }

      constituencyWins[row.winningConstituencyParty] = (constituencyWins[row.winningConstituencyParty] || 0) + 1;
      partyListWins[row.winningPartyListParty] = (partyListWins[row.winningPartyListParty] || 0) + 1;
    });

    const topConstituencyParty = Object.entries(constituencyWins).sort((a, b) => b[1] - a[1])[0];
    const topPartyListParty = Object.entries(partyListWins).sort((a, b) => b[1] - a[1])[0];

    return {
      totalDistricts: data.length,
      totalDiscrepancy,
      maxDiscrepancyDistrict,
      topConstituencyParty,
      topPartyListParty,
      constituencyWins,
      criticalCount
    };
  }, [data]);

  // --- Chart Data ---
  const seatDistributionData = useMemo(() => {
    if (!kpis) return [];
    return Object.entries(kpis.constituencyWins)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [kpis]);

  const topDiscrepancyData = useMemo(() => {
    return [...data]
      .sort((a, b) => b.absDiscrepancy - a.absDiscrepancy)
      .slice(0, 15)
      .map(d => ({
        name: `${d.province} เขต ${d.district}`,
        discrepancy: d.discrepancy,
        absDiscrepancy: d.absDiscrepancy,
        fill: d.discrepancy > 0 ? '#ef4444' : '#3b82f6' // Red for > 0, Blue for < 0
      }));
  }, [data]);

  const scatterData = useMemo(() => {
    return data.map(d => ({
      x: d.constituencyVoters,
      y: d.partyListVoters,
      name: `${d.province} เขต ${d.district}`,
      discrepancy: d.absDiscrepancy
    }));
  }, [data]);

  const sortedTableData = useMemo(() => {
    return [...data].sort((a, b) => b.absDiscrepancy - a.absDiscrepancy);
  }, [data]);

  const criticalDistrictsData = useMemo(() => {
    return data.filter(d => d.isCritical).sort((a, b) => b.absDiscrepancy - a.absDiscrepancy);
  }, [data]);

  const invalidBallotsChartData = useMemo(() => {
    return [...data]
      .filter(d => d.invalidPercentage > 0)
      .sort((a, b) => b.absDiscrepancy - a.absDiscrepancy)
      .slice(0, 50) // Top 50 by discrepancy to see correlation
      .map(d => ({
        name: `${d.province} เขต ${d.district}`,
        discrepancy: d.absDiscrepancy,
        invalidPercentage: parseFloat(d.invalidPercentage.toFixed(2))
      }));
  }, [data]);

  const turnoutComparisonData = useMemo(() => {
    return [...data]
      .filter(d => d.turnoutDifference !== 0 && !isNaN(d.turnoutDifference))
      .sort((a, b) => b.turnoutDifference - a.turnoutDifference)
      .slice(0, 20); // Top 20 biggest differences
  }, [data]);


  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-6 flex flex-col">
      <div className="max-w-7xl mx-auto space-y-6 flex-grow w-full">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Search className="w-8 h-8 text-blue-600" />
              Election Audit & Fraud Detection Tool
            </h1>
            <p className="text-slate-500 mt-2">วิเคราะห์ความผิดปกติ ยอดเขย่ง และเปรียบเทียบผู้มาใช้สิทธิ์ (Election 69)</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : !error && data.length === 0 ? (
          <div className="bg-white p-12 rounded-xl shadow-sm border border-slate-100 text-center flex flex-col items-center justify-center min-h-[400px]">
            <Database className="w-16 h-16 text-slate-300 mb-4" />
            <h2 className="text-xl font-semibold text-slate-700 mb-2">กำลังรอข้อมูล...</h2>
            <p className="text-slate-500 max-w-md">
              ไม่พบไฟล์ข้อมูลในระบบ กรุณาตรวจสอบว่ามีไฟล์ <code className="bg-slate-100 px-2 py-1 rounded text-sm">plot.json</code>, <code className="bg-slate-100 px-2 py-1 rounded text-sm">constituency.json</code>, <code className="bg-slate-100 px-2 py-1 rounded text-sm">referendum.json</code>
            </p>
          </div>
        ) : !error && data.length > 0 ? (
          <div className="space-y-6">
            {/* Navigation Tabs */}
            <div className="flex space-x-2 bg-white p-2 rounded-lg shadow-sm border border-slate-100 overflow-x-auto">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-colors whitespace-nowrap ${
                  activeTab === 'overview' 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                ภาพรวมยอดเขย่ง (Overview)
              </button>
              <button
                onClick={() => setActiveTab('audit')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-colors whitespace-nowrap ${
                  activeTab === 'audit' 
                    ? 'bg-red-50 text-red-700' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                ตรวจสอบความผิดปกติ (Audit)
                {kpis?.criticalCount > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full ml-1">
                    {kpis.criticalCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('referendum')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-colors whitespace-nowrap ${
                  activeTab === 'referendum' 
                    ? 'bg-green-50 text-green-700' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <CheckSquare className="w-4 h-4" />
                ประชามติ (Referendum Turnout)
              </button>
            </div>

            {/* TAB: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-in fade-in duration-300">
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
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-slate-800">ข้อมูลรายเขต (เรียงตามยอดเขย่งสูงสุด)</h3>
                    <span className="text-sm text-slate-500">ทั้งหมด {sortedTableData.length} เขต</span>
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
                        {sortedTableData.map((row, idx) => (
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
              </div>
            )}

            {/* TAB: AUDIT */}
            {activeTab === 'audit' && (
              <div className="space-y-6 animate-in fade-in duration-300">
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
                              <td className="px-4 py-3 text-sm font-bold text-red-600 text-right">{row.absDiscrepancy.toLocaleString()}</td>
                              <td className="px-4 py-3 text-sm text-slate-600 text-right">{row.marginOfVictory.toLocaleString()}</td>
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
            )}

            {/* TAB: REFERENDUM */}
            {activeTab === 'referendum' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                  <h3 className="text-lg font-semibold text-slate-800 mb-1">เปรียบเทียบผู้มาใช้สิทธิ์ (เลือกตั้ง vs ประชามติ)</h3>
                  <p className="text-sm text-slate-500 mb-4">ตารางแสดงเขตเลือกตั้งที่มีส่วนต่างผู้มาใช้สิทธิ์ ส.ส. เขต มากกว่า ประชามติ สูงที่สุด 20 อันดับ</p>
                  
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
                        {turnoutComparisonData.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="px-6 py-3 text-sm text-slate-800 font-medium">{row.province} เขต {row.district}</td>
                            <td className="px-6 py-3 text-sm text-slate-600 text-right">{row.constituencyVoters.toLocaleString()}</td>
                            <td className="px-6 py-3 text-sm text-slate-600 text-right">{row.referendumTurnout.toLocaleString()}</td>
                            <td className="px-6 py-3 text-sm font-bold text-orange-600 text-right">
                              {row.turnoutDifference > 0 ? '+' : ''}{row.turnoutDifference.toLocaleString()}
                            </td>
                            <td className="px-6 py-3 text-sm text-slate-500 text-right">
                              {row.turnoutDiffPercentage > 0 ? '+' : ''}{row.turnoutDiffPercentage.toFixed(2)}%
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
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* References Section - Always visible at the bottom */}
      <div className="max-w-7xl mx-auto w-full mt-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 text-sm">
          <h3 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-500" />
            แหล่งที่มาของข้อมูล (References)
          </h3>
          <div className="space-y-4 text-slate-600">
            <p>
              <strong>ผู้จัดทำ Dashboard:</strong> Patchara Phongyeelar
            </p>
            <p>
              <strong>ผู้รวบรวมและวิเคราะห์ข้อมูล:</strong> Ronnakrit Rattanasriampaipong (จากโพสต์ <a href="https://www.facebook.com/PaleoLipidRR/posts/pfbid025E2GT1iqu18rpgD1dgrmHtFHmsVi8ChwUW7wMNJ8MRynB2UZGaU8RQhEVqXhV8Crl" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Facebook EP.3 เรื่องบัตรเขย่ง</a>)
            </p>
            <p>
              <strong>แหล่งข้อมูลตั้งต้น:</strong> ข้อมูล 94% ไม่เป็นทางการ ดึงข้อมูลจาก ECTReport ของ กกต. เมื่อวันที่ 10 ก.พ. 2569 มาจาก Rocket Media Lab <a href="https://rocketmedialab.co/database-vote62-report-69-1/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://rocketmedialab.co/database-vote62-report-69-1/</a>
            </p>
            <p>
              <strong>ชุดข้อมูล (Google Sheets):</strong> <a href="https://docs.google.com/spreadsheets/d/1qHfinVgpd9CuHgk9oG4J9kbhkLnAFH0i/edit?fbclid=IwY2xjawQEyO5leHRuA2FlbQIxMABicmlkETJPV251V2h6aFh5OERGUHRRc3J0YwZhcHBfaWQQMjIyMDM5MTc4ODIwMDg5MgABHqv-FX950e1tpM5zGwH_syUgWmG26-jCtEScXup-bubtVYivSacuqLX-gaW9_aem_NEJgQFhSaooMBrQREtEGLw&gid=878137751#gid=878137751" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline overflow-hidden text-ellipsis whitespace-nowrap block sm:inline">คลิกเพื่อดูไฟล์คะแนนดิบ</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Subcomponent for KPI Cards
function KPI_Card({ title, value, icon, subtitle, trend }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-medium text-slate-500">{title}</h3>
        <div className="p-2 bg-slate-50 rounded-lg">{icon}</div>
      </div>
      <div className="mt-auto">
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        <div className="flex items-center gap-2 mt-1">
          {subtitle && <p className="text-sm font-medium text-slate-600">{subtitle}</p>}
          {trend && <p className="text-xs text-slate-400">({trend})</p>}
        </div>
      </div>
    </div>
  );
}

export default App;
