'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { clinicLibraryService } from '@/domains/library/library.service';
import type { DeviceItem, LibraryListResponse } from '@/domains/library/library.types';

function GlobalBadge({ isGlobal }: { isGlobal: boolean }) {
  return isGlobal ? (
    <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-600">
      مكتبة عامة
    </span>
  ) : (
    <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600">
      مكتبة العيادة
    </span>
  );
}

function DeviceCard({ item }: { item: DeviceItem }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      {/* Image or placeholder */}
      <div className="w-full h-36 bg-gray-100 flex items-center justify-center overflow-hidden">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.nameArabic ?? item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <svg className="text-gray-300" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <path d="M8 21h8M12 17v4" />
          </svg>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-black text-gray-800 text-sm leading-snug">
            {item.nameArabic ?? item.name}
          </h3>
          <GlobalBadge isGlobal={item.isGlobal} />
        </div>

        {(item.manufacturer || item.model) && (
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
            {item.manufacturer && (
              <span>
                <span className="font-semibold text-gray-600">الشركة: </span>
                {item.manufacturer}
              </span>
            )}
            {item.model && (
              <span>
                <span className="font-semibold text-gray-600">الموديل: </span>
                {item.model}
              </span>
            )}
          </div>
        )}

        {item.description && (
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">{item.description}</p>
        )}
      </div>
    </div>
  );
}

export default function DevicesPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'ar';

  const [items, setItems] = useState<DeviceItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 12;

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result: LibraryListResponse<DeviceItem> = await clinicLibraryService.getDevices({
        page,
        pageSize: perPage,
        search: search || undefined,
      });
      setItems(result.items);
      setTotalCount(result.totalCount);
      setTotalPages(result.totalPages);
    } catch {
      setError('فشل في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { loadItems(); }, [loadItems]);

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  return (
    <div className="space-y-5" dir="rtl">
      {/* Library sub-nav */}
      <div className="flex gap-1 bg-white rounded-xl shadow-sm px-3 py-2 overflow-x-auto">
        {[
          { href: `/${locale}/clinic/library/exercises`,   label: "التمارين" },
          { href: `/${locale}/clinic/library/modalities`,  label: "الجلسات" },
          { href: `/${locale}/clinic/library/devices`,     label: "الأجهزة" },
          { href: `/${locale}/clinic/library/assessments`, label: "التقييمات" },
          { href: `/${locale}/clinic/library/treatments`,  label: "بروتوكولات العلاج" },
        ].map(item => (
          <Link key={item.href} href={item.href}
            className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors
              ${ typeof window !== "undefined" && window.location.pathname.includes(item.href.split("/").pop()!)
                ? "bg-[#29AAFE] text-white"
                : "text-gray-500 hover:bg-gray-100" }`}>
            {item.label}
          </Link>
        ))}
      </div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-gray-800">
          الأجهزة الطبية{' '}
          {!loading && (
            <span className="text-sm font-normal text-gray-400">({totalCount})</span>
          )}
        </h1>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2 max-w-xs">
        <svg className="text-gray-400 shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          placeholder="بحث..."
          className="bg-transparent border-none outline-none text-sm w-full text-right"
          dir="rtl"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>
      )}

      {/* Card Grid */}
      {loading ? (
        <div className="bg-white rounded-2xl shadow-sm px-4 py-16 text-center text-gray-400 text-sm">
          جاري التحميل...
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm px-4 py-16 text-center text-gray-400 text-sm">
          لا توجد بيانات
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => (
            <DeviceCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 py-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40 transition-colors"
          >
            السابق
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                page === n ? 'bg-[#29AAFE] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {n}
            </button>
          ))}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40 transition-colors"
          >
            التالي
          </button>
        </div>
      )}
    </div>
  );
}
