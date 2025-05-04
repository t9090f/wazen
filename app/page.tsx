'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import DataTable from '../components/DataTable';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';

type PatientData = {
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
};

export default function Home() {
  const [data, setData] = useState<PatientData[]>([]);
  const [editingData, setEditingData] = useState<PatientData | null>(null);
  const { register, handleSubmit, reset, setValue } = useForm<PatientData>({
    defaultValues: {
      scannerManufacturer: 'samsung',
      scannerModel: 'GC85A',
      modality: 'DR',
      examDescription: 'CXR',
      projection: 'PA',
      aecManual: 'AEC',
      grid: 'IN',
      sid: 180
    }
  });

  // جلب البيانات عند تحميل الصفحة
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/patient-data');
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const onSubmit = async (formData: PatientData) => {
    try {
      if (editingData) {
        // تحديث البيانات
        const { _id, createdAt, ...updateData } = formData;
        
        // تحويل القيم الفارغة إلى null
        const processedData = Object.entries(updateData).reduce((acc, [key, value]) => {
          if (value === '') {
            acc[key] = null;
          } else if (typeof value === 'string' && !isNaN(Number(value))) {
            acc[key] = Number(value);
          } else {
            acc[key] = value;
          }
          return acc;
        }, {} as Record<string, any>);
        
        console.log('Sending update request for ID:', editingData._id);
        console.log('Update data:', processedData);
        
        try {
          const updateResponse = await fetch(`/api/patient-data/${editingData._id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(processedData),
          });

          if (!updateResponse.ok) {
            const errorData = await updateResponse.json();
            console.error('Update failed:', errorData);
            throw new Error(errorData.error || 'Failed to update data');
          }

          const updatedData = await updateResponse.json();
          console.log('Update successful:', updatedData);
          
          // تحديث البيانات في الواجهة
          setData(prevData => prevData.map(item => 
            item._id === editingData._id ? updatedData : item
          ));
          
          toast.success('تم تحديث البيانات بنجاح');
          reset();
          setEditingData(null);
        } catch (error) {
          console.error('Error updating data:', error);
          toast.error('حدث خطأ أثناء تحديث البيانات');
        }
      } else {
        // إضافة بيانات جديدة
        const response = await fetch('/api/patient-data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to save data');
        }

        const newData = await response.json();
        setData(prevData => [newData, ...prevData]);
        toast.success('تم حفظ البيانات بنجاح');
        reset();
      }
    } catch (error) {
      console.error('Error submitting data:', error);
      toast.error(error instanceof Error ? error.message : 'حدث خطأ أثناء حفظ البيانات');
    }
  };

  const handleEdit = (data: PatientData) => {
    setEditingData(data);
    Object.entries(data).forEach(([key, value]) => {
      if (key !== '_id' && key !== 'createdAt') {
        setValue(key as keyof PatientData, value);
      }
    });
  };

  const handleDelete = (id: string) => {
    setData(data.filter(item => item._id !== id));
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <Toaster position="top-center" reverseOrder={false} />
      <h1 className="text-4xl font-bold mb-6 text-center bg-gradient-to-r from-blue-600 to-blue-800 text-transparent bg-clip-text py-2">
        WAZEN Indicator For Patients Radiation Dose
      </h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-4 gap-2">
          <div>
            <label className="block mb-1 text-sm">Scanner Manufacturer</label>
            <input {...register('scannerManufacturer')} className="w-full p-1 text-sm border rounded" />
          </div>
          
          <div>
            <label className="block mb-1 text-sm">Scanner Model</label>
            <input {...register('scannerModel')} className="w-full p-1 text-sm border rounded" />
          </div>
          
          <div>
            <label className="block mb-1 text-sm">Month</label>
            <select {...register('month')} className="w-full p-1 text-sm border rounded">
              <option value="">اختر الشهر</option>
              {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block mb-1 text-sm">Gender</label>
            <select {...register('gender')} className="w-full p-1 text-sm border rounded">
              <option value="">اختر الجنس</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
            </select>
          </div>
          
          <div>
            <label className="block mb-1 text-sm">Age</label>
            <input type="number" {...register('age')} className="w-full p-1 text-sm border rounded" />
          </div>
          
          <div>
            <label className="block mb-1 text-sm">Weight (Kg)</label>
            <input type="number" step="0.01" {...register('weight')} className="w-full p-1 text-sm border rounded" />
          </div>
          
          <div>
            <label className="block mb-1 text-sm">Modality</label>
            <select {...register('modality')} className="w-full p-1 text-sm border rounded">
              <option value="">اختر النوع</option>
              <option value="CR">CR</option>
              <option value="DR">DR</option>
            </select>
          </div>
          
          <div>
            <label className="block mb-1 text-sm">Exam Description</label>
            <select 
              {...register('examDescription')} 
              className="w-full p-1 text-sm border rounded"
              onChange={(e) => {
                if (e.target.value === 'ABDO') {
                  setValue('projection', 'AP');
                  setValue('sid', 100);
                } else if (e.target.value === 'CXR') {
                  setValue('projection', 'PA');
                  setValue('sid', 180);
                }
              }}
            >
              <option value="">اختر الفحص</option>
              <option value="CXR">CXR</option>
              <option value="ABDO">ABDO</option>
            </select>
          </div>
          
          <div>
            <label className="block mb-1 text-sm">Series Projection</label>
            <select {...register('projection')} className="w-full p-1 text-sm border rounded">
              <option value="">اختر الإسقاط</option>
              <option value="AP">AP</option>
              <option value="PA">PA</option>
              <option value="LAT">LAT</option>
            </select>
          </div>
          
          <div>
            <label className="block mb-1 text-sm">AEC/Manual</label>
            <select {...register('aecManual')} className="w-full p-1 text-sm border rounded">
              <option value="">اختر النوع</option>
              <option value="AEC">AEC</option>
              <option value="Manual">Manual</option>
            </select>
          </div>
          
          <div>
            <label className="block mb-1 text-sm">kVp</label>
            <input type="number" step="0.1" {...register('kvp')} className="w-full p-1 text-sm border rounded" />
          </div>
          
          <div>
            <label className="block mb-1 text-sm">mAs</label>
            <input type="number" step="0.01" {...register('mas')} className="w-full p-1 text-sm border rounded" />
          </div>
          
          <div>
            <label className="block mb-1 text-sm">DAP (Gy.cm²)</label>
            <input type="number" step="0.001" {...register('dap')} className="w-full p-1 text-sm border rounded" />
          </div>
          
          <div>
            <label className="block mb-1 text-sm">Grid</label>
            <select {...register('grid')} className="w-full p-1 text-sm border rounded">
              <option value="">اختر الشبكة</option>
              <option value="IN">IN</option>
              <option value="OUT">OUT</option>
            </select>
          </div>
          
          <div>
            <label className="block mb-1 text-sm">Focal Spot Size</label>
            <input type="number" step="0.1" {...register('focalSpot')} className="w-full p-1 text-sm border rounded" />
          </div>
          
          <div>
            <label className="block mb-1 text-sm">SID (cm)</label>
            <select {...register('sid')} className="w-full p-1 text-sm border rounded">
              <option value="">اختر المسافة</option>
              <option value="180">180</option>
              <option value="100">100</option>
            </select>
          </div>
          
          <div>
            <label className="block mb-1 text-sm">Collimation (cm²)</label>
            <input type="number" step="0.1" {...register('collimation')} className="w-full p-1 text-sm border rounded" />
          </div>
          
          <div>
            <label className="block mb-1 text-sm">Tube output</label>
            <input type="number" step="0.001" {...register('tubeOutput')} className="w-full p-1 text-sm border rounded" />
          </div>
        </div>
        
        <div className="flex gap-4">
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            {editingData ? 'تحديث البيانات' : 'إضافة بيانات'}
          </button>
          {editingData && (
            <button
              type="button"
              onClick={() => {
                reset();
                setEditingData(null);
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              إلغاء التعديل
            </button>
          )}
        </div>
      </form>
      
      <DataTable data={data} onEdit={handleEdit} onDelete={handleDelete} />
    </main>
  );
} 