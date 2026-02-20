export const PARTY_COLORS = {
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
  'กล้าธรรม': '#22c55e', // Green
  'เสรีรวมไทย': '#eed341', // Yellow
  'เป็นธรรม': '#0097a8', // Teal
  'ไทรวมพลัง': '#ec4899', // Pink
  'Other': '#94a3b8' // Gray
};

export const getPartyColor = (partyName) => PARTY_COLORS[partyName] || PARTY_COLORS['Other'];
