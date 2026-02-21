import React, { useState } from 'react';
import { ChevronDown, ChevronUp, MapPin, TrendingUp, TrendingDown, Filter } from 'lucide-react';
import { REGIONS } from '../constants/regionMapping';

function ProvinceAnalysis({ provinceAnalysisData, selectedRegion, setSelectedRegion }) {
  const [expandedProvinces, setExpandedProvinces] = useState({});

  const toggleProvince = (province) => {
    setExpandedProvinces(prev => ({
      ...prev,
      [province]: !prev[province]
    }));
  };

  const expandAll = () => {
    const allExpanded = {};
    provinceAnalysisData.forEach(({ province }) => {
      allExpanded[province] = true;
    });
    setExpandedProvinces(allExpanded);
  };

  const collapseAll = () => {
    setExpandedProvinces({});
  };

  if (!provinceAnalysisData || provinceAnalysisData.length === 0) {
    return null;
  }

  // Calculate total districts based on filtered data
  const totalDistricts = provinceAnalysisData.reduce((sum, prov) => sum + prov.districtCount, 0);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-500" />
            วิเคราะห์รายจังหวัด (Province Analysis)
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            แสดงยอดเขย่งแยกตามจังหวัด เขตไหนมีบัตรเขตมากกว่าบัญชีรายชื่อ (สีแดง) และเขตไหนมีบัญชีรายชื่อมากกว่าบัตรเขต (สีน้ำเงิน)
          </p>
        </div>
        
        {/* Region Filter - Only for Province Analysis */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <label htmlFor="province-region-filter" className="text-sm font-medium text-slate-700">ภาค:</label>
            <select
              id="province-region-filter"
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {REGIONS.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
            <span className="text-sm text-slate-500">
              ({provinceAnalysisData.length} จังหวัด, {totalDistricts} เขต)
            </span>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={expandAll}
              className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              ขยายทั้งหมด
            </button>
            <button
              onClick={collapseAll}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
            >
              ยุบทั้งหมด
            </button>
          </div>
        </div>
      </div>

      {/* Province List */}
      <div className="divide-y divide-slate-100">
        {provinceAnalysisData.map(({ province, region, districtCount, totalDiscrepancy, constituencyGreater, partyListGreater }) => {
          const isExpanded = expandedProvinces[province];
          const hasDiscrepancy = constituencyGreater.length > 0 || partyListGreater.length > 0;
          const netDiscrepancy = totalDiscrepancy;

          return (
            <div key={province} className="overflow-hidden">
              {/* Province Header (Clickable) */}
              <button
                onClick={() => toggleProvince(province)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${hasDiscrepancy ? 'bg-orange-400' : 'bg-green-400'}`} />
                  <div>
                    <span className="font-semibold text-slate-800">{province}</span>
                    <span className="text-xs text-slate-500 ml-2">({region})</span>
                    <span className="text-xs text-slate-400 ml-2">{districtCount} เขต</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {/* Net Discrepancy Badge */}
                  {hasDiscrepancy && (
                    <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                      netDiscrepancy > 0 
                        ? 'bg-red-100 text-red-700' 
                        : netDiscrepancy < 0 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-slate-100 text-slate-600'
                    }`}>
                      ยอดเขย่งรวม: {(netDiscrepancy || 0) > 0 ? '+' : ''}{(netDiscrepancy || 0).toLocaleString()}
                    </span>
                  )}
                  {!hasDiscrepancy && (
                    <span className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                      ไม่มียอดเขย่ง
                    </span>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="px-6 pb-4 bg-slate-50/50">
                  {/* Constituency > Party List (Red) */}
                  {constituencyGreater.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-red-700 mb-2 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        เขตที่บัตร ส.ส. เขต &gt; บัญชีรายชื่อ ({constituencyGreater.length} เขต)
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {constituencyGreater.map(({ district, discrepancy }) => (
                          <div
                            key={district}
                            className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-medium flex items-center gap-2"
                          >
                            <span>เขต {district}</span>
                            <span className="font-bold">+{(discrepancy || 0).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Party List > Constituency (Blue) */}
                  {partyListGreater.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-blue-700 mb-2 flex items-center gap-2">
                        <TrendingDown className="w-4 h-4" />
                        เขตที่บัตรบัญชีรายชื่อ &gt; ส.ส. เขต ({partyListGreater.length} เขต)
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {partyListGreater.map(({ district, discrepancy }) => (
                          <div
                            key={district}
                            className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium flex items-center gap-2"
                          >
                            <span>เขต {district}</span>
                            <span className="font-bold">{(discrepancy || 0).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* No Discrepancy */}
                  {!hasDiscrepancy && (
                    <div className="py-4 text-center text-slate-500">
                      ทุกเขตในจังหวัดนี้มีจำนวนบัตร ส.ส. เขต เท่ากับ บัญชีรายชื่อ
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ProvinceAnalysis;
