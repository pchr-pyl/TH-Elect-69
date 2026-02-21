const fs = require('fs');
const path = require('path');

const OCR_CONSTITUENCY_DIR = path.join(__dirname, 'data-ocr', 'election-69-OCR-result-main', 'data', 'matched', 'constituency');
const OCR_PARTY_LIST_DIR = path.join(__dirname, 'data-ocr', 'election-69-OCR-result-main', 'data', 'matched', 'party_list');
const OUTPUT_PATH = path.join(__dirname, 'data-processed', 'plot-ocr.json');
const DASHBOARD_OUTPUT_PATH = path.join(__dirname, 'dashboard', 'public', 'plot-ocr.json');

function loadJsonDir(dir) {
  const map = {};
  if (!fs.existsSync(dir)) return map;
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  for (const file of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
      // Use filename (e.g. "10_1") as key to avoid English/Thai province_name mismatch
      const key = file.replace('.json', '');
      map[key] = data;
    } catch (e) {
      console.warn(`Warning: Could not parse ${file}`);
    }
  }
  return map;
}

function getTopParty(results) {
  if (!results || results.length === 0) return 'ไม่ทราบ';
  return results.reduce((best, cur) => cur.votes > best.votes ? cur : best, results[0]).party;
}

function getMargin(results) {
  if (!results || results.length < 2) return 0;
  const sorted = [...results].sort((a, b) => b.votes - a.votes);
  return sorted[0].votes - sorted[1].votes;
}

function main() {
  console.log('Loading OCR constituency data...');
  const constituencyMap = loadJsonDir(OCR_CONSTITUENCY_DIR);
  console.log(`Loaded ${Object.keys(constituencyMap).length} constituency files`);

  console.log('Loading OCR party list data...');
  const partyListMap = loadJsonDir(OCR_PARTY_LIST_DIR);
  console.log(`Loaded ${Object.keys(partyListMap).length} party list files`);

  const results = [];
  const allKeys = new Set([...Object.keys(constituencyMap), ...Object.keys(partyListMap)]);

  for (const key of allKeys) {
    const con = constituencyMap[key];
    const pl = partyListMap[key];

    if (!con && !pl) continue;

    // Skip districts that only have one side - discrepancy would be meaningless
    if (!con || !pl) continue;

    // Skip if either side has no voters data (OCR extraction failure)
    const conVoters = Number(con?.summary?.voters_came) || 0;
    const plVoters = Number(pl?.summary?.voters_came) || 0;
    if (conVoters === 0 || plVoters === 0) continue;

    const province = (con || pl).province_name;
    const district = (con || pl).constituency_number;

    const constituencyVoters = Number(con?.summary?.voters_came) || 0;
    const partyListVoters = Number(pl?.summary?.voters_came) || 0;
    const discrepancy = constituencyVoters - partyListVoters;
    const absDiscrepancy = Math.abs(discrepancy);

    const winningConstituencyParty = con ? getTopParty(con.results) : 'ไม่ทราบ';
    const winningPartyListParty = pl ? getTopParty(pl.results) : 'ไม่ทราบ';

    const constituencyMargin = con ? getMargin(con.results) : 0;
    const partyListMargin = pl ? getMargin(pl.results) : 0;

    const invalidVotes = Number(con?.summary?.invalid_votes) || 0;
    const eligibleVoters = Number(con?.summary?.eligible_voters) || 0;
    const invalidPercentage = constituencyVoters > 0 ? (invalidVotes / constituencyVoters) * 100 : 0;
    const isCritical = absDiscrepancy > constituencyMargin && constituencyMargin > 0;

    results.push({
      province: String(province || ''),
      district: Number(district) || 0,
      constituencyVoters,
      partyListVoters,
      discrepancy,
      absDiscrepancy,
      winningConstituencyParty: String(winningConstituencyParty || 'ไม่ทราบ'),
      winningPartyListParty: String(winningPartyListParty || 'ไม่ทราบ'),
      constituencyMargin,
      partyListMargin,
      invalidVotes,
      eligibleVoters,
      invalidPercentage,
      isCritical,
      referendumTurnout: 0,
      turnoutDifference: 0,
      turnoutDiffPercentage: 0,
      dataSource: 'ocr'
    });
  }

  results.sort((a, b) => {
    if (a.province < b.province) return -1;
    if (a.province > b.province) return 1;
    return a.district - b.district;
  });

  console.log(`Generated ${results.length} district records`);

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(results, null, 2), 'utf8');
  console.log(`Saved to ${OUTPUT_PATH}`);

  fs.writeFileSync(DASHBOARD_OUTPUT_PATH, JSON.stringify(results, null, 2), 'utf8');
  console.log(`Saved to ${DASHBOARD_OUTPUT_PATH}`);
}

main();
