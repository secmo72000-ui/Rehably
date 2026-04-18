'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { clinicLibraryService } from '@/domains/library/library.service';
import type { TreatmentDto, LibraryListResponse } from '@/domains/library/library.types';

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

const COLUMNS = ['الكود', 'الاسم', 'الاسم بالعربي', 'منطقة الجسم', 'المنطقة المصابة', 'المدة (أسابيع)', 'الجلسات المتوقعة', 'النوع'];

export default function TreatmentsPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'ar';

  const [items, setItems] = useState<TreatmentDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 20;

  // expanded row for details
  const [expanded, setExpanded] = useState<string | null>(null);

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result: LibraryListResponse<TreatmentDto> = await clinicLibraryService.getTreatments({
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
          بروتوكولات العلاج{' '}
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
                {COLUMNS.map(h => (
                  <th key={h} className="px-4 py-3 text-right text-xs font-bold text-gray-400 whitespace-nowrap">
                    {h}
                  </th>
                ))}
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={COLUMNS.length + 1} className="text-center py-12 text-gray-400 text-sm">
                    جاري التحميل...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={COLUMNS.length + 1} className="text-center py-12 text-gray-400 text-sm">
                    لا توجد بيانات
                  </td>
                </tr>
              ) : (
                items.map(item => (
                  <React.Fragment key={item.id}>
                    <tr
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-gray-500 whitespace-nowrap">{item.code}</td>
                      <td className="px-4 py-3 font-bold text-gray-800 whitespace-nowrap">{item.name}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{item.nameArabic ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">{item.bodyRegionCategoryName ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">{item.affectedArea ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs text-center whitespace-nowrap">
                        {item.minDurationWeeks ?? '—'}–{item.maxDurationWeeks ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs text-center">{item.expectedSessions ?? '—'}</td>
                      <td className="px-4 py-3">
                        <GlobalBadge isGlobal={item.isGlobal} />
                      </td>
                      <td className="px-4 py-3">
                        <svg
                          className={`w-4 h-4 text-gray-400 transition-transform ${expanded === item.id ? 'rotate-180' : ''}`}
                          fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </td>
                    </tr>

                    {/* Expanded detail row */}
                    {expanded === item.id && (
                      <tr className="bg-blue-50/40 border-b border-gray-100">
                        <td colSpan={COLUMNS.length + 1} className="px-6 py-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            {item.description && (
                              <div>
                                <span className="font-bold text-gray-500 text-xs block mb-1">الوصف</span>
                                <p className="text-gray-700">{item.description}</p>
                              </div>
                            )}
                            {item.clinicalNotes && (
                              <div>
                                <span className="font-bold text-gray-500 text-xs block mb-1">ملاحظات سريرية</span>
                                <p className="text-gray-700">{item.clinicalNotes}</p>
                              </div>
                            )}
                            {item.contraindications && (
                              <div>
                                <span className="font-bold text-gray-500 text-xs block mb-1">موانع الاستخدام</span>
                                <p className="text-red-600">{item.contraindications}</p>
                              </div>
                            )}
                            {item.redFlags && (
                              <div>
                                <span className="font-bold text-gray-500 text-xs block mb-1">علامات التحذير</span>
                                <p className="text-orange-600">{item.redFlags}</p>
                              </div>
                            )}
                            {item.sourceReference && (
                              <div>
                                <span className="font-bold text-gray-500 text-xs block mb-1">المرجع العلمي</span>
                                <p className="text-gray-500 text-xs">{item.sourceReference}{item.sourceDetails ? ` — ${item.sourceDetails}` : ''}</p>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
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
