import React from 'react';
import { AlertTriangle, Database } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-red-200 max-w-2xl w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-xl font-bold text-red-900">เกิดข้อผิดพลาดในระบบ</h1>
            </div>
            <p className="text-slate-600 mb-4">
              ขออภัย เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณารีเฟรชหน้าเว็บหรือลองใหม่อีกครั้ง
            </p>
            <details className="bg-slate-50 p-4 rounded-lg text-sm">
              <summary className="cursor-pointer font-medium text-slate-700 mb-2">
                รายละเอียดข้อผิดพลาด (สำหรับนักพัฒนา)
              </summary>
              <pre className="text-red-600 whitespace-pre-wrap overflow-auto max-h-48">
                {this.state.error?.toString()}
              </pre>
            </details>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              รีเฟรชหน้าเว็บ
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
