'use client';

import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

interface PatientData {
  _id: string;
  scannerManufacturer?: string;
  scannerModel?: string;
  month?: number;
  gender?: string;
  age?: number;
  weight?: number;
  modality?: string;
  examDescription?: string;
  projection?: string;
  aecManual?: string;
  kvp?: number;
  mas?: number;
  dap?: number;
  grid?: string;
  focalSpot?: number;
  sid?: number;
  collimation?: number;
  tubeOutput?: number;
  createdAt: string;
}

interface DataTableProps {
  data: PatientData[];
  onEdit?: (data: PatientData) => void;
  onDelete?: (id: string) => void;
}

export default function DataTable({ data, onEdit, onDelete }: DataTableProps) {
  const [filteredData, setFilteredData] = useState<PatientData[]>([]);
  const [monthFilter, setMonthFilter] = useState<string>('all');
  const [examFilter, setExamFilter] = useState<string>('all');

  useEffect(() => {
    let filtered = [...data];
    
    if (monthFilter !== 'all') {
      filtered = filtered.filter(item => item.month?.toString() === monthFilter);
    }
    
    if (examFilter !== 'all') {
      filtered = filtered.filter(item => item.examDescription === examFilter);
    }
    
    setFilteredData(filtered);
  }, [data, monthFilter, examFilter]);

  const handleDelete = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه البيانات؟')) {
      try {
        const response = await fetch(`/api/patient-data/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          onDelete?.(id);
          alert('تم حذف البيانات بنجاح');
        } else {
          alert('حدث خطأ أثناء حذف البيانات');
        }
      } catch (error) {
        console.error('Error deleting data:', error);
        alert('حدث خطأ أثناء حذف البيانات');
      }
    }
  };

  const exportToExcel = () => {
    // تحضير البيانات للتصدير
    const exportData = filteredData.map(item => ({
      'Scanner Manufacturer': item.scannerManufacturer || '',
      'Scanner Model': item.scannerModel || '',
      'Month': item.month || '',
      'Gender': item.gender || '',
      'Age': item.age || '',
      'Weight (Kg)': item.weight || '',
      'Modality': item.modality || '',
      'Exam Description': item.examDescription || '',
      'Series Projection (AP, PA, LAT)': item.projection || '',
      'AEC/Manual': item.aecManual || '',
      'kVp': item.kvp || '',
      'mAs': item.mas || '',
      'DAP (Gy.cm²)': item.dap || '',
      'Grid': item.grid || '',
      'Focal Spot Size': item.focalSpot || '',
      'SID (cm)': item.sid || '',
      'Collimation (cm²)': item.collimation || '',
      'Tube output (mGy/mAs@SID)': item.tubeOutput || '',
      'Created At': new Date(item.createdAt).toLocaleString()
    }));

    // إنشاء ورقة عمل Excel
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Patient Data');

    // تصدير الملف
    XLSX.writeFile(wb, 'patient_data.xlsx');
  };

  return (
    <div className="mt-8">
      <div className="flex gap-4 mb-4">
        <select
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="all">All Months</option>
          {Array.from({length: 12}, (_, i) => i + 1).map(month => (
            <option key={month} value={month}>{month}</option>
          ))}
        </select>
        
        <select
          value={examFilter}
          onChange={(e) => setExamFilter(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="all">All Exams</option>
          <option value="CXR">CXR</option>
          <option value="ABDO">ABDO</option>
        </select>

        <button
          onClick={exportToExcel}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Export to Excel
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="px-4 py-2 border">#</th>
              <th className="px-4 py-2 border">Scanner Manufacturer</th>
              <th className="px-4 py-2 border">Scanner Model</th>
              <th className="px-4 py-2 border">Month</th>
              <th className="px-4 py-2 border">Gender</th>
              <th className="px-4 py-2 border">Age</th>
              <th className="px-4 py-2 border">Weight</th>
              <th className="px-4 py-2 border">Modality</th>
              <th className="px-4 py-2 border">Exam Description</th>
              <th className="px-4 py-2 border">Series Projection (AP, PA, LAT)</th>
              <th className="px-4 py-2 border">AEC/Manual</th>
              <th className="px-4 py-2 border">kVp</th>
              <th className="px-4 py-2 border">mAs</th>
              <th className="px-4 py-2 border">DAP</th>
              <th className="px-4 py-2 border">Grid</th>
              <th className="px-4 py-2 border">Focal Spot</th>
              <th className="px-4 py-2 border">SID</th>
              <th className="px-4 py-2 border">Collimation</th>
              <th className="px-4 py-2 border">Tube Output</th>
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, index) => (
              <tr key={item._id}>
                <td className="px-4 py-2 border">{index + 1}</td>
                <td className="px-4 py-2 border">{item.scannerManufacturer || '-'}</td>
                <td className="px-4 py-2 border">{item.scannerModel || '-'}</td>
                <td className="px-4 py-2 border">{item.month || '-'}</td>
                <td className="px-4 py-2 border">{item.gender || '-'}</td>
                <td className="px-4 py-2 border">{item.age || '-'}</td>
                <td className="px-4 py-2 border">{item.weight || '-'}</td>
                <td className="px-4 py-2 border">{item.modality || '-'}</td>
                <td className="px-4 py-2 border">{item.examDescription || '-'}</td>
                <td className="px-4 py-2 border">{item.projection || '-'}</td>
                <td className="px-4 py-2 border">{item.aecManual || '-'}</td>
                <td className="px-4 py-2 border">{item.kvp || '-'}</td>
                <td className="px-4 py-2 border">{item.mas || '-'}</td>
                <td className="px-4 py-2 border">{item.dap || '-'}</td>
                <td className="px-4 py-2 border">{item.grid || '-'}</td>
                <td className="px-4 py-2 border">{item.focalSpot || '-'}</td>
                <td className="px-4 py-2 border">{item.sid || '-'}</td>
                <td className="px-4 py-2 border">{item.collimation || '-'}</td>
                <td className="px-4 py-2 border">{item.tubeOutput || '-'}</td>
                <td className="px-4 py-2 border">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit?.(item)}
                      className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    >
                      حذف
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 