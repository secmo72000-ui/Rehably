import React from 'react';
import type { Device } from '../useLibrariesPage';

interface DeviceCardProps {
  device: Device;
  onEdit: () => void;
  onDelete: () => void;
}

export function DeviceCard({ device, onEdit, onDelete }: DeviceCardProps) {
  return (
    <div className="bg-white border transition-all rounded-xl p-4 relative flex flex-col h-full shadow-sm hover:shadow-md hover:border-Primary-200" style={{ borderColor: '#e5e7eb' }}>

      {/* Header Row */}
      <div className="flex justify-between items-start mb-4">
        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onDelete}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-red-50 hover:border-red-200 hover:text-red-500 text-gray-400 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
          <button
            onClick={onEdit}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-400 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
        </div>

        {/* Manufacturer badge */}
        {device.manufacturer && (
          <div className="bg-gray-100 text-gray-600 px-3 py-1 rounded text-xs font-semibold">
            {device.manufacturer}
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 text-end space-y-3">
        <h3 className="font-bold text-gray-900 text-base leading-tight text-right">
          {device.name}
        </h3>

        {device.model && (
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-gray-500 block">الموديل</span>
            <p className="text-sm text-gray-600">{device.model}</p>
          </div>
        )}

        {device.description && (
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-gray-500 block">الوصف</span>
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{device.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}
