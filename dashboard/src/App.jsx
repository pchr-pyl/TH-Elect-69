import React, { useState, useEffect, useMemo } from 'react';
import { Database, Search } from 'lucide-react';

// Components
import ErrorBoundary from './components/ErrorBoundary';
import NavigationTabs from './components/NavigationTabs';
import LoadingSkeleton from './components/LoadingSkeleton';
import OverviewTab from './components/OverviewTab';
import AuditTab from './components/AuditTab';
import ReferendumTab from './components/ReferendumTab';

// Constants
import { PARTY_COLORS } from './constants/partyColors';

// Data validation schema (simple validation without Zod for now)
const validatePlotData = (data) => {
  if (!Array.isArray(data)) return false;
  if (data.length === 0) return false;
  return data.every(row => 
    row && 
    typeof row['จังหวัด'] === 'string' &&
    (typeof row['เขตเลือกตั้งที่'] === 'number' || typeof row['เขตเลือกตั้งที่'] === 'string')
  );
};

function AppContent() {
  const [data, setData] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to process raw JSON data
  const processData = (plotData, constituencyData, referendumData) => {
    // Validate input data
    if (!validatePlotData(plotData)) {
      throw new Error('Invalid plot data format');
    }

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
    const loadData = async () => {
      try {
        const [plotData, constituencyData, referendumData] = await Promise.all([
          fetch('/plot.json').then(res => {
            if (!res.ok) throw new Error('Failed to load plot.json');
            return res.json();
          }),
          fetch('/constituency.json').then(res => res.json()).catch(() => []),
          fetch('/referendum.json').then(res => res.json()).catch(() => [])
        ]);

        if (plotData && plotData.length > 0) {
          setData(processData(plotData, constituencyData, referendumData));
          setIsLoading(false);
        } else {
          throw new Error('No data found in plot.json');
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError('ไม่สามารถโหลดข้อมูลได้ โปรดตรวจสอบว่ามีไฟล์ JSON อยู่ในโฟลเดอร์ public');
        setIsLoading(false);
      }
    };

    loadData();
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
      .slice(0, 20);
  }, [data]);

  // --- Render ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-6 flex flex-col">
        <div className="max-w-7xl mx-auto w-full">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <Search className="w-8 h-8 text-blue-600" aria-hidden="true" />
                Election Audit & Fraud Detection Tool
              </h1>
              <p className="text-slate-500 mt-2">วิเคราะห์ความผิดปกติ ยอดเขย่ง และเปรียบเทียบผู้มาใช้สิทธิ์ (Election 69)</p>
            </div>
          </header>
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-6 flex flex-col">
        <div className="max-w-7xl mx-auto w-full">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <Search className="w-8 h-8 text-blue-600" aria-hidden="true" />
                Election Audit & Fraud Detection Tool
              </h1>
              <p className="text-slate-500 mt-2">วิเคราะห์ความผิดปกติ ยอดเขย่ง และเปรียบเทียบผู้มาใช้สิทธิ์ (Election 69)</p>
            </div>
          </header>
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md" role="alert" aria-live="assertive">
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-6 flex flex-col">
      <div className="max-w-7xl mx-auto space-y-6 flex-grow w-full">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Search className="w-8 h-8 text-blue-600" aria-hidden="true" />
              Election Audit & Fraud Detection Tool
            </h1>
            <p className="text-slate-500 mt-2">วิเคราะห์ความผิดปกติ ยอดเขย่ง และเปรียบเทียบผู้มาใช้สิทธิ์ (Election 69)</p>
          </div>
        </header>

        {data.length === 0 ? (
          <div className="bg-white p-12 rounded-xl shadow-sm border border-slate-100 text-center flex flex-col items-center justify-center min-h-[400px]">
            <Database className="w-16 h-16 text-slate-300 mb-4" aria-hidden="true" />
            <h2 className="text-xl font-semibold text-slate-700 mb-2">กำลังรอข้อมูล...</h2>
            <p className="text-slate-500 max-w-md">
              ไม่พบไฟล์ข้อมูลในระบบ กรุณาตรวจสอบว่ามีไฟล์ <code className="bg-slate-100 px-2 py-1 rounded text-sm">plot.json</code>, <code className="bg-slate-100 px-2 py-1 rounded text-sm">constituency.json</code>, <code className="bg-slate-100 px-2 py-1 rounded text-sm">referendum.json</code>
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <NavigationTabs 
              activeTab={activeTab} 
              setActiveTab={setActiveTab} 
              criticalCount={kpis?.criticalCount || 0}
            />

            {activeTab === 'overview' && (
              <OverviewTab
                data={data}
                kpis={kpis}
                seatDistributionData={seatDistributionData}
                topDiscrepancyData={topDiscrepancyData}
                scatterData={scatterData}
                sortedTableData={sortedTableData}
              />
            )}

            {activeTab === 'audit' && (
              <AuditTab
                criticalDistrictsData={criticalDistrictsData}
                invalidBallotsChartData={invalidBallotsChartData}
              />
            )}

            {activeTab === 'referendum' && (
              <ReferendumTab
                turnoutComparisonData={turnoutComparisonData}
              />
            )}
          </div>
        )}
      </div>

      {/* References Section - Always visible at the bottom */}
      <footer className="max-w-7xl mx-auto w-full mt-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 text-sm">
          <h3 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-500" aria-hidden="true" />
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
      </footer>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

export default App;
