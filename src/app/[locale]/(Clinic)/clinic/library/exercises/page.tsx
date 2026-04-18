'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { clinicLibraryService } from '@/domains/library/library.service';
import type { ExerciseDto, LibraryListResponse } from '@/domains/library/library.types';

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

export default function ExercisesPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'ar';

  const [items, setItems] = useState<ExerciseDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 20;

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result: LibraryListResponse<ExerciseDto> = await clinicLibraryService.getExercises({
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

  const columns = ['الاسم', 'الاسم بالعربي', 'منطقة الجسم', 'التكرار', 'الثواني', 'العلامات', 'النوع'];

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
              ${ typeof window !== "undefined" <div className="space-y-5" dir="rtl"><div className="space-y-5" dir="rtl"> window.location.pathname.includes(item.href.split("/").pop()!)
                ? "bg-[#29AAFE] text-white"
                : "text-gray-500 hover:bg-gray-100" }`}>
            {item.label}
          </Link>
        ))}
      </div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-gray-800">
          التمارين{' '}
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

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" dir="rtl">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {columns.map(h => (
                  <th key={h} className="px-4 py-3 text-right text-xs font-bold text-gray-400 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-12 text-gray-400 text-sm">
                    جاري التحميل...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-12 text-gray-400 text-sm">
                    لا توجد بيانات
                  </td>
                </tr>
              ) : (
                items.map(item => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-bold text-gray-800 whitespace-nowrap">{item.name}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{item.nameArabic ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap text-xs">{item.bodyRegionCategoryName ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs text-center">{item.repeats ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs text-center">{item.holdSeconds ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs max-w-[180px] truncate">{item.tags ?? '—'}</td>
                    <td className="px-4 py-3">
                      <GlobalBadge isGlobal={item.isGlobal} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 py-4 border-t border-gray-100">
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
    </div>
  );
}
