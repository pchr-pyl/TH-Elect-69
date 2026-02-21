import React from 'react';
import { X, AlertTriangle, ExternalLink } from 'lucide-react';

const MISSING_CONSTITUENCY = [
  { province: 'บุรีรัมย์', districts: 'ทั้ง 10 เขต', note: 'ไม่มี PDF จาก กกต.' },
  { province: 'กรุงเทพมหานคร', districts: 'เขต 15', note: 'กกต. ยังไม่ประกาศ' },
  { province: 'ชัยภูมิ', districts: 'เขต 6, 8', note: '' },
  { province: 'ตราด', districts: 'เขต 4', note: '' },
  { province: 'นครพนม', districts: 'เขต 8', note: '' },
  { province: 'นราธิวาส', districts: 'เขต 2', note: '' },
  { province: 'ปัตตานี', districts: 'เขต 6', note: '' },
  { province: 'พระนครศรีอยุธยา', districts: 'เขต 8', note: '' },
  { province: 'แพร่', districts: 'เขต 8', note: '' },
  { province: 'มุกดาหาร', districts: 'เขต 6', note: '' },
  { province: 'เชียงใหม่', districts: 'เขต 8', note: '' },
  { province: 'น่าน', districts: 'เขต 1', note: 'กกต. ยังไม่ประกาศ' },
  { province: 'สกลนคร', districts: 'เขต 6', note: '' },
  { province: 'สงขลา', districts: 'เขต 6', note: '' },
  { province: 'เพชรบูรณ์', districts: 'เขต 7', note: '' },
  { province: 'แม่ฮ่องสอน', districts: 'เขต 6', note: '' },
  { province: 'ยะลา', districts: 'เขต 6', note: '' },
  { province: 'สมุทรปราการ', districts: 'เขต 6', note: '' },
];

function OcrDataModal({ onClose, displayedCount }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ocr-modal-title"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
            <h2 id="ocr-modal-title" className="text-lg font-bold text-slate-900">
              กกต. สส.6/1 — ข้อมูลทางการ (OCR)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
            aria-label="ปิด"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Coverage */}
          <section>
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">
              📊 ความครอบคลุมของข้อมูล
            </h3>
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-slate-600 font-semibold"></th>
                    <th className="px-4 py-3 text-center text-slate-600 font-semibold">สส.เขต</th>
                    <th className="px-4 py-3 text-center text-slate-600 font-semibold">บัญชีรายชื่อ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="px-4 py-3 text-slate-700 font-medium">เขตที่นำเข้าแล้ว</td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-bold text-green-700">377</span>
                      <span className="text-slate-400 text-xs"> / 400 (94.3%)</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-bold text-green-700">386</span>
                      <span className="text-slate-400 text-xs"> / 400 (96.5%)</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-slate-700 font-medium">จังหวัด</td>
                    <td className="px-4 py-3 text-center font-bold text-slate-800">76</td>
                    <td className="px-4 py-3 text-center font-bold text-slate-800">76</td>
                  </tr>
                  <tr className="bg-green-50">
                    <td className="px-4 py-3 text-green-800 font-semibold">แสดงในเว็บนี้ (มีข้อมูลทั้ง 2 ฝั่ง)</td>
                    <td colSpan={2} className="px-4 py-3 text-center">
                      <span className="font-bold text-green-700 text-base">{displayedCount} เขต</span>
                      <span className="text-green-600 text-xs ml-1">(เฉพาะเขตที่มีข้อมูลครบทั้งสส.เขต และบัญชีรายชื่อ)</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Key Stats Constituency */}
          <section>
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">
              ตัวเลขสำคัญ — แบบแบ่งเขต (Constituency)
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'ผู้มีสิทธิเลือกตั้ง', value: '49,925,837', color: 'slate' },
                { label: 'คะแนนรวมที่ถูกต้อง', value: '32,949,094', color: 'green' },
                { label: 'บัตรเสีย', value: '1,265,063', color: 'red' },
                { label: 'ไม่เลือกผู้สมัครผู้ใด', value: '1,520,450', color: 'orange' },
              ].map(({ label, value, color }) => (
                <div key={label} className={`bg-${color}-50 border border-${color}-100 rounded-xl p-3`}>
                  <p className={`text-xs text-${color}-600 mb-1`}>{label}</p>
                  <p className={`text-lg font-bold text-${color}-800`}>{value}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Key Stats Party List */}
          <section>
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">
              ตัวเลขสำคัญ — บัญชีรายชื่อ (Party List) Top 5
            </h3>
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-slate-600 font-semibold">พรรค</th>
                    <th className="px-4 py-3 text-right text-slate-600 font-semibold">คะแนน</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { party: 'ประชาชน', votes: '10,715,927' },
                    { party: 'ภูมิใจไทย', votes: '5,967,124' },
                    { party: 'เพื่อไทย', votes: '5,376,290' },
                    { party: 'ประชาธิปัตย์', votes: '3,910,896' },
                    { party: 'เศรษฐกิจ', votes: '1,109,392' },
                  ].map(({ party, votes }) => (
                    <tr key={party} className="hover:bg-slate-50">
                      <td className="px-4 py-2.5 text-slate-700">{party}</td>
                      <td className="px-4 py-2.5 text-right font-medium text-slate-800">{votes}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 font-semibold">
                    <td className="px-4 py-2.5 text-slate-800">รวมทุกพรรค</td>
                    <td className="px-4 py-2.5 text-right text-slate-900">33,903,675</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Not yet announced */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                กกต. ยังไม่ประกาศผล (3 เขต)
              </h3>
            </div>
            <div className="overflow-hidden rounded-xl border border-amber-200 bg-amber-50">
              <table className="w-full text-sm">
                <thead className="bg-amber-100">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-amber-800 font-semibold">จังหวัด</th>
                    <th className="px-4 py-2.5 text-left text-amber-800 font-semibold">เขต</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100">
                  {[
                    { province: 'กรุงเทพมหานคร', district: 'เขตเลือกตั้งที่ 15' },
                    { province: 'น่าน', district: 'เขตเลือกตั้งที่ 1' },
                    { province: 'อุดรธานี', district: 'เขตเลือกตั้งที่ 6' },
                  ].map(({ province, district }) => (
                    <tr key={province + district}>
                      <td className="px-4 py-2.5 text-amber-900 font-medium">{province}</td>
                      <td className="px-4 py-2.5 text-amber-800">{district}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Missing districts */}
          <section>
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-1">
              เขตที่ขาดหายในชุดข้อมูล
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              สส.เขต — ขาด 23 เขต &nbsp;|&nbsp; บัญชีรายชื่อ — ขาด 14 เขต
            </p>
            <div className="overflow-hidden rounded-xl border border-slate-200 max-h-52 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-slate-600 font-semibold">จังหวัด</th>
                    <th className="px-4 py-2.5 text-left text-slate-600 font-semibold">เขตที่ขาด</th>
                    <th className="px-4 py-2.5 text-left text-slate-600 font-semibold">หมายเหตุ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {MISSING_CONSTITUENCY.map(({ province, districts, note }) => (
                    <tr key={province + districts} className="hover:bg-slate-50">
                      <td className="px-4 py-2 text-slate-700 font-medium">{province}</td>
                      <td className="px-4 py-2 text-slate-600">{districts}</td>
                      <td className="px-4 py-2 text-slate-400 text-xs">{note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Attribution */}
          <section className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600 space-y-1.5">
            <p className="font-semibold text-slate-800">📌 ที่มาของข้อมูล OCR</p>
            <p>
              จัดทำโดย <span className="font-semibold text-slate-900">ชานนท์ เงินทองดี (Chanon Ngernthongdee)</span>
            </p>
            <p>
              OCR จากแบบ สส.6/1 ของ{' '}
              <a href="https://www.ect.go.th" target="_blank" rel="noopener noreferrer"
                className="text-blue-600 hover:underline inline-flex items-center gap-1">
                สำนักงานคณะกรรมการการเลือกตั้ง (กกต.) <ExternalLink className="w-3 h-3" />
              </a>
            </p>
            <p>
              <a href="https://github.com/killernay/election-69-OCR-result" target="_blank" rel="noopener noreferrer"
                className="text-blue-600 hover:underline inline-flex items-center gap-1">
                election-69-OCR-result (GitHub) <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default OcrDataModal;
