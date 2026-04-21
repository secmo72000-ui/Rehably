'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { featuresService } from '@/domains/features/features.service';
import type {
  Feature, FeatureCategory,
  CreateFeatureRequest, UpdateFeatureRequest,
  CreateFeatureCategoryRequest,
} from '@/domains/features/features.types';
import { PRICING_TYPE_LABELS, PRICING_TYPES } from '@/domains/features/features.types';
import { getApiError } from '@/shared/utils';

// ── helpers ────────────────────────────────────────────────

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}>
      {label}
    </span>
  );
}

function Field({
  label, value, onChange, type = 'text', required = false, error, placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; required?: boolean; error?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-600 mb-1.5">
        {label}{required && <span className="text-red-500 mr-0.5">*</span>}
      </label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#29AAFE] transition-colors ${
          error ? 'border-red-400 bg-red-50' : 'border-gray-200'
        }`}
        dir="rtl"
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ── Feature Drawer ─────────────────────────────────────────

function FeatureDrawer({
  isOpen, onClose, onSaved, categories, editing,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  categories: FeatureCategory[];
  editing: Feature | null;
}) {
  const [form, setForm] = useState({
    categoryId: '', name: '', code: '', description: '', pricingType: '0', displayOrder: '1',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (editing) {
      setForm({
        categoryId: editing.categoryId,
        name: editing.name,
        code: editing.code,
        description: editing.description ?? '',
        pricingType: String(editing.pricingType),
        displayOrder: String(editing.displayOrder),
      });
    } else {
      setForm({ categoryId: categories[0]?.id ?? '', name: '', code: '', description: '', pricingType: '0', displayOrder: '1' });
    }
    setErrors({});
    setApiError(null);
  }, [isOpen, editing, categories]);

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'الاسم مطلوب';
    if (!editing && !form.code.trim()) e.code = 'الكود مطلوب';
    if (!form.categoryId) e.categoryId = 'الفئة مطلوبة';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true); setApiError(null);
    try {
      if (editing) {
        const req: UpdateFeatureRequest = {
          name: form.name,
          description: form.description || undefined,
          displayOrder: Number(form.displayOrder),
        };
        await featuresService.update(editing.id, req);
      } else {
        const req: CreateFeatureRequest = {
          categoryId: form.categoryId,
          name: form.name,
          code: form.code.toLowerCase().replace(/\s+/g, '-'),
          description: form.description || undefined,
          pricingType: Number(form.pricingType),
          displayOrder: Number(form.displayOrder),
        };
        await featuresService.create(req);
      }
      onSaved();
      onClose();
    } catch (err) {
      setApiError(getApiError(err, 'فشل في الحفظ'));
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-end" dir="rtl" onClick={onClose}>
      <div className="w-full max-w-md h-full bg-white shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <span className="text-base font-black text-gray-800">{editing ? 'تعديل الميزة' : 'إضافة ميزة جديدة'}</span>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {apiError && <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl px-3 py-2.5">⚠️ {apiError}</div>}

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">الفئة<span className="text-red-500 mr-0.5">*</span></label>
            <select
              value={form.categoryId}
              onChange={e => set('categoryId', e.target.value)}
              disabled={!!editing}
              className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#29AAFE] bg-white ${errors.categoryId ? 'border-red-400' : 'border-gray-200'} ${editing ? 'opacity-60' : ''}`}
            >
              <option value="">اختر الفئة</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {errors.categoryId && <p className="mt-1 text-xs text-red-500">{errors.categoryId}</p>}
          </div>

          <Field label="الاسم" required value={form.name} onChange={v => set('name', v)} error={errors.name} placeholder="مثال: الفواتير" />

          {!editing && (
            <Field
              label="الكود (Code)"
              required
              value={form.code}
              onChange={v => set('code', v)}
              error={errors.code}
              placeholder="مثال: invoices"
            />
          )}

          <Field label="الوصف" value={form.description} onChange={v => set('description', v)} placeholder="وصف اختياري للميزة" />

          {/* Pricing Type */}
          {!editing && (
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">نوع التسعير</label>
              <select
                value={form.pricingType}
                onChange={e => set('pricingType', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#29AAFE] bg-white"
              >
                {PRICING_TYPES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
          )}

          <Field label="ترتيب العرض" type="number" value={form.displayOrder} onChange={v => set('displayOrder', v)} />
        </div>
        <div className="p-5 border-t border-gray-100 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50">إلغاء</button>
          <button onClick={handleSubmit} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-[#29AAFE] hover:bg-[#1A8FD9] disabled:opacity-60 text-white text-sm font-bold">
            {saving ? 'جارٍ الحفظ…' : editing ? 'حفظ التعديلات' : 'إضافة'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Category Drawer ────────────────────────────────────────

function CategoryDrawer({
  isOpen, onClose, onSaved, editing,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  editing: FeatureCategory | null;
}) {
  const [form, setForm] = useState({ name: '', code: '', description: '', displayOrder: '1' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (editing) {
      setForm({ name: editing.name, code: editing.code, description: editing.description ?? '', displayOrder: String(editing.displayOrder) });
    } else {
      setForm({ name: '', code: '', description: '', displayOrder: '1' });
    }
    setErrors({});
    setApiError(null);
  }, [isOpen, editing]);

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'الاسم مطلوب';
    if (!editing && !form.code.trim()) e.code = 'الكود مطلوب';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true); setApiError(null);
    try {
      if (editing) {
        await featuresService.updateCategory(editing.id, { name: form.name, description: form.description || undefined, displayOrder: Number(form.displayOrder) });
      } else {
        const req: CreateFeatureCategoryRequest = {
          name: form.name,
          code: form.code.toLowerCase().replace(/\s+/g, '-'),
          description: form.description || undefined,
          displayOrder: Number(form.displayOrder),
        };
        await featuresService.createCategory(req);
      }
      onSaved();
      onClose();
    } catch (err) {
      setApiError(getApiError(err, 'فشل في الحفظ'));
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-end" dir="rtl" onClick={onClose}>
      <div className="w-full max-w-md h-full bg-white shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <span className="text-base font-black text-gray-800">{editing ? 'تعديل الفئة' : 'إضافة فئة جديدة'}</span>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {apiError && <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl px-3 py-2.5">⚠️ {apiError}</div>}
          <Field label="الاسم" required value={form.name} onChange={v => set('name', v)} error={errors.name} placeholder="مثال: الميزات الأساسية" />
          {!editing && (
            <Field label="الكود (Code)" required value={form.code} onChange={v => set('code', v)} error={errors.code} placeholder="مثال: core" />
          )}
          <Field label="الوصف" value={form.description} onChange={v => set('description', v)} placeholder="وصف اختياري" />
          <Field label="ترتيب العرض" type="number" value={form.displayOrder} onChange={v => set('displayOrder', v)} />
        </div>
        <div className="p-5 border-t border-gray-100 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50">إلغاء</button>
          <button onClick={handleSubmit} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-[#29AAFE] hover:bg-[#1A8FD9] disabled:opacity-60 text-white text-sm font-bold">
            {saving ? 'جارٍ الحفظ…' : editing ? 'حفظ التعديلات' : 'إضافة'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main FeaturesTab ───────────────────────────────────────

export function FeaturesTab() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [categories, setCategories] = useState<FeatureCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // sub-tab: features | categories
  const [subTab, setSubTab] = useState<'features' | 'categories'>('features');

  // feature drawer
  const [featureDrawerOpen, setFeatureDrawerOpen] = useState(false);
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);

  // category drawer
  const [catDrawerOpen, setCatDrawerOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<FeatureCategory | null>(null);

  // deactivate confirm
  const [deactivatingId, setDeactivatingId] = useState<string | null>(null);

  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [f, c] = await Promise.all([featuresService.getAll(), featuresService.getCategories()]);
      setFeatures(f);
      setCategories(c);
    } catch (err) {
      setError(getApiError(err, 'فشل في تحميل البيانات'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleDeactivateFeature = async (id: string) => {
    setDeactivatingId(id);
    try {
      await featuresService.deactivate(id);
      showToast('تم إلغاء تفعيل الميزة');
      load();
    } catch (err) {
      showToast(getApiError(err, 'فشل في إلغاء التفعيل'));
    } finally {
      setDeactivatingId(null);
    }
  };

  const handleDeactivateCategory = async (id: string) => {
    setDeactivatingId(id);
    try {
      await featuresService.deactivateCategory(id);
      showToast('تم إلغاء تفعيل الفئة');
      load();
    } catch (err) {
      showToast(getApiError(err, 'فشل في إلغاء التفعيل'));
    } finally {
      setDeactivatingId(null);
    }
  };

  // Group features by category
  const featuresByCategory = categories.map(cat => ({
    category: cat,
    features: features.filter(f => f.categoryId === cat.id),
  }));
  const uncategorized = features.filter(f => !categories.find(c => c.id === f.categoryId));

  const totalActive = features.filter(f => f.isActive).length;
  const totalInactive = features.filter(f => !f.isActive).length;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-black text-gray-800">إدارة المميزات</h2>
          <span className="px-2.5 py-0.5 bg-[#E8F5FF] text-[#29AAFE] text-xs font-bold rounded-full">{features.length} ميزة</span>
          {totalActive > 0 && <span className="px-2.5 py-0.5 bg-green-50 text-green-600 text-xs font-bold rounded-full">{totalActive} نشطة</span>}
          {totalInactive > 0 && <span className="px-2.5 py-0.5 bg-gray-100 text-gray-500 text-xs font-bold rounded-full">{totalInactive} غير نشطة</span>}
        </div>
        <button
          onClick={() => {
            if (subTab === 'features') { setEditingFeature(null); setFeatureDrawerOpen(true); }
            else { setEditingCategory(null); setCatDrawerOpen(true); }
          }}
          className="flex items-center gap-1.5 bg-[#29AAFE] hover:bg-[#1A8FD9] text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors"
        >
          <span className="text-base">+</span>
          {subTab === 'features' ? 'إضافة ميزة' : 'إضافة فئة'}
        </button>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 border-b-2 border-gray-200">
        {([['features', 'المميزات'], ['categories', 'الفئات']] as const).map(([id, label]) => (
          <button key={id} onClick={() => setSubTab(id)}
            className={`px-5 py-2.5 text-sm font-bold transition-all border-b-2 -mb-[2px] ${subTab === id ? 'text-[#29AAFE] border-[#29AAFE]' : 'text-gray-400 border-transparent hover:text-gray-600'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">⚠️ {error}</div>}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-[#29AAFE] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* ── Features sub-tab ─────────────────────────────── */}
      {!loading && subTab === 'features' && (
        <div className="space-y-6">
          {featuresByCategory.map(({ category, features: catFeatures }) => (
            <div key={category.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {/* Category header */}
              <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-gray-700">{category.name}</span>
                  <code className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{category.code}</code>
                  {!category.isActive && <Badge label="غير نشطة" color="bg-red-50 text-red-500" />}
                </div>
                <span className="text-xs text-gray-400">{catFeatures.length} ميزة</span>
              </div>

              {catFeatures.length === 0 ? (
                <div className="px-5 py-6 text-center text-gray-400 text-sm">لا توجد مميزات في هذه الفئة</div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {['الاسم', 'الكود', 'التسعير', 'الحالة', 'إجراءات'].map(h => (
                        <th key={h} className="px-4 py-2.5 text-right text-xs font-bold text-gray-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {catFeatures.map(feat => (
                      <tr key={feat.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-gray-800">{feat.name}</div>
                          {feat.description && <div className="text-xs text-gray-400 mt-0.5">{feat.description}</div>}
                        </td>
                        <td className="px-4 py-3">
                          <code className="text-xs bg-[#E8F5FF] text-[#29AAFE] px-2 py-0.5 rounded font-mono">{feat.code}</code>
                        </td>
                        <td className="px-4 py-3">
                          <Badge label={PRICING_TYPE_LABELS[feat.pricingType] ?? String(feat.pricingType)} color="bg-purple-50 text-purple-600" />
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            label={feat.isActive ? 'نشطة' : 'غير نشطة'}
                            color={feat.isActive ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => { setEditingFeature(feat); setFeatureDrawerOpen(true); }}
                              className="text-xs text-[#29AAFE] hover:underline font-semibold"
                            >
                              تعديل
                            </button>
                            {feat.isActive && (
                              <button
                                onClick={() => handleDeactivateFeature(feat.id)}
                                disabled={deactivatingId === feat.id}
                                className="text-xs text-red-400 hover:text-red-600 hover:underline font-semibold disabled:opacity-50"
                              >
                                {deactivatingId === feat.id ? '...' : 'إلغاء تفعيل'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ))}

          {/* Uncategorized */}
          {uncategorized.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-3 bg-yellow-50 border-b border-yellow-100">
                <span className="text-sm font-black text-yellow-700">بدون فئة</span>
              </div>
              <table className="w-full text-sm">
                <tbody>
                  {uncategorized.map(feat => (
                    <tr key={feat.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold text-gray-800">{feat.name}</td>
                      <td className="px-4 py-3"><code className="text-xs bg-[#E8F5FF] text-[#29AAFE] px-2 py-0.5 rounded">{feat.code}</code></td>
                      <td className="px-4 py-3">
                        <button onClick={() => { setEditingFeature(feat); setFeatureDrawerOpen(true); }} className="text-xs text-[#29AAFE] hover:underline">تعديل</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {features.length === 0 && !loading && (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-3">⚙️</div>
              <p className="font-semibold">لا توجد مميزات بعد</p>
              <p className="text-xs mt-1">أضف مميزات لتتمكن من إنشاء باقات اشتراك</p>
            </div>
          )}
        </div>
      )}

      {/* ── Categories sub-tab ───────────────────────────── */}
      {!loading && subTab === 'categories' && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {categories.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-3">📁</div>
              <p className="font-semibold">لا توجد فئات بعد</p>
            </div>
          ) : (
            <table className="w-full text-sm" dir="rtl">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {['الفئة', 'الكود', 'عدد المميزات', 'الحالة', 'إجراءات'].map(h => (
                    <th key={h} className="px-4 py-3 text-right text-xs font-bold text-gray-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {categories.map(cat => {
                  const count = features.filter(f => f.categoryId === cat.id).length;
                  return (
                    <tr key={cat.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-bold text-gray-800">{cat.name}</div>
                        {cat.description && <div className="text-xs text-gray-400 mt-0.5">{cat.description}</div>}
                      </td>
                      <td className="px-4 py-3">
                        <code className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">{cat.code}</code>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-semibold text-gray-600">{count} ميزة</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          label={cat.isActive ? 'نشطة' : 'غير نشطة'}
                          color={cat.isActive ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => { setEditingCategory(cat); setCatDrawerOpen(true); }}
                            className="text-xs text-[#29AAFE] hover:underline font-semibold"
                          >
                            تعديل
                          </button>
                          {cat.isActive && (
                            <button
                              onClick={() => handleDeactivateCategory(cat.id)}
                              disabled={deactivatingId === cat.id}
                              className="text-xs text-red-400 hover:text-red-600 hover:underline font-semibold disabled:opacity-50"
                            >
                              {deactivatingId === cat.id ? '...' : 'إلغاء تفعيل'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Drawers */}
      <FeatureDrawer
        isOpen={featureDrawerOpen}
        onClose={() => setFeatureDrawerOpen(false)}
        onSaved={() => { load(); showToast(editingFeature ? 'تم تعديل الميزة بنجاح' : 'تمت إضافة الميزة بنجاح'); }}
        categories={categories}
        editing={editingFeature}
      />
      <CategoryDrawer
        isOpen={catDrawerOpen}
        onClose={() => setCatDrawerOpen(false)}
        onSaved={() => { load(); showToast(editingCategory ? 'تم تعديل الفئة بنجاح' : 'تمت إضافة الفئة بنجاح'); }}
        editing={editingCategory}
      />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-lg text-sm font-bold text-white bg-gray-800">
          ✓ {toast}
        </div>
      )}
    </div>
  );
}
