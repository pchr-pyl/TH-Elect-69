import React, { useMemo } from 'react';
import { provinceLayout } from '../utils/provinceLayout';

export default function TileMap({ data, viewMode, getPartyColor }) {
  // Group data by province
  const provincesData = useMemo(() => {
    const grouped = {};
    data.forEach(row => {
      const pName = row['จังหวัด'];
      if (!pName) return;
      if (!grouped[pName]) {
        grouped[pName] = [];
      }
      grouped[pName].push(row);
    });

    // Sort constituencies within each province
    Object.values(grouped).forEach(list => {
      list.sort((a, b) => parseInt(a['เขตเลือกตั้งที่']) - parseInt(b['เขตเลือกตั้งที่']));
    });

    return grouped;
  }, [data]);

  // Map layout to grid
  // Find max X and max Y to define grid size
  const maxX = Math.max(...provinceLayout.map(p => p.x));
  const maxY = Math.max(...provinceLayout.map(p => p.y));

  const gridCells = [];
  for (let y = 0; y <= maxY; y++) {
    for (let x = 0; x <= maxX; x++) {
      const provinceInfo = provinceLayout.find(p => p.x === x && p.y === y);
      if (provinceInfo) {
        const pName = provinceInfo.name;
        const constituencies = provincesData[pName] || [];
        gridCells.push(
          <div key={`${x}-${y}`} className="p-1 min-h-[60px]" style={{ gridColumn: x + 1, gridRow: y + 1 }}>
            <div className="text-[10px] text-slate-600 font-medium mb-1 truncate text-center" title={pName}>
              {pName}
            </div>
            <div className="flex flex-wrap gap-0.5 justify-center">
              {constituencies.map(c => {
                const party = viewMode === 'constituency' 
                  ? c['พรรคชนะ ส.ส. เขต'] 
                  : c['พรรคชนะ บัญชีรายชือ'];
                const color = getPartyColor(party);
                return (
                  <div 
                    key={c['เขตเลือกตั้งที่']}
                    className="w-4 h-4 text-[9px] flex items-center justify-center text-white font-bold rounded-sm cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: color || '#ccc' }}
                    title={`เขต ${c['เขตเลือกตั้งที่']} - ${party}`}
                  >
                    {c['เขตเลือกตั้งที่']}
                  </div>
                );
              })}
            </div>
          </div>
        );
      } else {
        gridCells.push(
          <div key={`${x}-${y}`} style={{ gridColumn: x + 1, gridRow: y + 1 }} />
        );
      }
    }
  }

  return (
    <div className="w-full overflow-x-auto bg-slate-50/50 p-4 rounded-xl border border-slate-100">
      <div 
        className="grid gap-1 min-w-[800px] mx-auto"
        style={{ 
          gridTemplateColumns: `repeat(${maxX + 1}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${maxY + 1}, minmax(60px, auto))`
        }}
      >
        {gridCells}
      </div>
    </div>
  );
}
