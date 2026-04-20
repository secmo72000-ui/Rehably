import React from 'react';
import { DeviceCard } from './DeviceCard';
import type { Device } from '../useLibrariesPage';

interface DevicesTabProps {
  devices: Device[];
  onEdit: (device: Device) => void;
  onDelete: (device: Device) => void;
}

export function DevicesTab({ devices, onEdit, onDelete }: DevicesTabProps) {
  if (devices.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
        <div className="text-4xl mb-4">🖥️</div>
        <p className="text-gray-500 font-medium">لا توجد أجهزة مضافة بعد</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6 flex-1">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6 w-full">
        {devices.map(device => (
          <DeviceCard
            key={device.id}
            device={device}
            onEdit={() => onEdit(device)}
            onDelete={() => onDelete(device)}
          />
        ))}
      </div>

      {/* Pagination placeholder */}
      <div className="flex justify-center items-center gap-2 pt-4 border-t border-gray-50 mt-4" dir="rtl">
        <button className="px-3 py-1 text-sm text-gray-500 hover:bg-gray-50 rounded border border-gray-200">
          السابق
        </button>
        <div className="flex items-center gap-1">
          <button className="w-8 h-8 flex items-center justify-center rounded text-sm font-medium bg-gray-900 text-white">1</button>
        </div>
        <button className="px-3 py-1 text-sm text-gray-500 hover:bg-gray-50 rounded border border-gray-200">
          التالي
        </button>
      </div>
    </div>
  );
}
