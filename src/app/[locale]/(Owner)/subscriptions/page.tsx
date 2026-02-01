'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { getTranslation } from '@/shared/i18n';
import type { Locale } from '@/configs/i18n.config';
import {
    TabNavigator,
    PackageCard,
    Drawer,
    ContentContainer,
    DynamicForm,
    type Tab,
    type PackageCardProps,
} from '@/ui/components';
import { Button } from '@/ui/primitives';
import { FeatureCard, CustomCategoryCard } from './_components';
import {
    financialPlanFormConfig,
    featureFormConfig,
    customCategoryFormConfig,
} from './configs';

// ========== Types ==========
interface Package {
    id: string;
    badge: string;
    badgeColor: 'blue' | 'green' | 'gray';
    price: number;
    description: string;
    features: Array<{ text: string; icon?: string }>;
    isFeatured?: boolean;
}

interface Feature {
    id: string;
    price: number;
    description: string;
    isHighPrice?: boolean;
}

interface CustomCategory {
    id: string;
    name: string;
    email: string;
    price: number;
    features: Array<{ text: string; icon?: string }>;
}

type DrawerType = 'add' | 'edit' | null;

// ========== Mock Data ==========
const mockPackages: Package[] = [
    {
        id: 'PKG-001',
        badge: 'مبتدئ',
        badgeColor: 'gray',
        price: 500,
        description:
            'الحل المثالي لبدايات عيادتك الرياضية سواء كانت فردية أوجماعية.',
        features: [
            { text: 'عدد مستخدمين: 3 شهريًا' },
            { text: 'عدد المرضى: يصل إلى 50 مريض' },
            { text: 'تخزين: 5 GB' },
            { text: 'سجل الأنشطة' },
            { text: 'صفحة خاصة للعرض' },
            { text: 'إشعارات أساسية ورسائل بريد إلكتروني' },
        ],
    },
    {
        id: 'PKG-002',
        badge: 'مقدم',
        badgeColor: 'blue',
        price: 500,
        description:
            'الحل المثالي لبدايات عيادتك الرياضية سواء كانت فردية أو جماعية. إضافية.',
        features: [
            { text: 'عدد مستخدمين: حتى 10 مستخدمين' },
            { text: 'عدد المرضى: يصل إلى 150 مريض' },
            { text: 'تخزين: 5 GB' },
            { text: 'سجل الأنشطة' },
            { text: 'صفحة خاصة للعرض' },
            { text: 'إشعارات أساسية ورسائل بريد إلكتروني' },
        ],
        isFeatured: true,
    },
    {
        id: 'PKG-003',
        badge: 'خبير',
        badgeColor: 'green',
        price: 500,
        description:
            'الحل المثالي لبدايات عيادتك الرياضية سواء كانت فردية أو جماعية. تجربة.',
        features: [
            { text: 'عدد مستخدمين: غير محدود' },
            { text: 'عدد المرضى: غير محدود' },
            { text: 'تخزين: 5 GB' },
            { text: 'سجل الأنشطة' },
            { text: 'صفحة خاصة للعرض' },
            { text: 'إشعارات أساسية ورسائل بريد إلكتروني' },
        ],
    },
];

const mockFeatures: Feature[] = [
    {
        id: 'FEAT-001',
        price: 40,
        description: 'عدد مستخدمين: حتى 10 مستخدمين',
        isHighPrice: false,
    },
    {
        id: 'FEAT-002',
        price: 500,
        description: 'عدد مستخدمين: حتى 10 مستخدمين',
        isHighPrice: true,
    },
    {
        id: 'FEAT-003',
        price: 50,
        description: 'عدد مستخدمين: حتى 10 مستخدمين',
        isHighPrice: false,
    },
    {
        id: 'FEAT-004',
        price: 200,
        description: 'عدد مستخدمين: حتى 10 مستخدمين',
        isHighPrice: true,
    },
    {
        id: 'FEAT-005',
        price: 120,
        description: 'عدد مستخدمين: حتى 10 مستخدمين',
        isHighPrice: true,
    },
    {
        id: 'FEAT-006',
        price: 100,
        description: 'عدد مستخدمين: حتى 10 مستخدمين',
        isHighPrice: true,
    },
    {
        id: 'FEAT-007',
        price: 10,
        description: 'عدد مستخدمين: حتى 10 مستخدمين',
        isHighPrice: false,
    },
    {
        id: 'FEAT-008',
        price: 50,
        description: 'عدد مستخدمين: حتى 10 مستخدمين',
        isHighPrice: false,
    },
    {
        id: 'FEAT-009',
        price: 60,
        description: 'عدد مستخدمين: حتى 10 مستخدمين',
        isHighPrice: false,
    },
];

const mockCustomCategories: CustomCategory[] = [
    {
        id: 'CAT-001',
        name: 'Clinic Group',
        email: 'uxeasin@gmail.com',
        price: 500,
        features: [
            { text: 'عدد مستخدمين: حتى 3 مستخدمين' },
            { text: 'عدد المرضى: يصل إلى 50 مريض' },
            { text: 'تخزين: 5 GB' },
            { text: 'سجل الأنشطة' },
        ],
    },
    {
        id: 'CAT-002',
        name: 'Clinic Group',
        email: 'uxeasin@gmail.com',
        price: 500,
        features: [
            { text: 'عدد مستخدمين: حتى 10 مستخدمين' },
            { text: 'عدد المرضى: يصل إلى 150 مريض' },
            { text: 'تخزين: 5 GB' },
            { text: 'سجل الأنشطة' },
        ],
    },
    {
        id: 'CAT-003',
        name: 'Clinic Group',
        email: 'uxeasin@gmail.com',
        price: 500,
        features: [
            { text: 'عدد مستخدمين: حتى 10 مستخدمين' },
            { text: 'عدد المرضى: يصل إلى 150 مريض' },
            { text: 'تخزين: 5 GB' },
            { text: 'سجل الأنشطة' },
        ],
    },
];

// ========== Page Component ==========
export default function SubscriptionsPage() {
    const params = useParams();
    const locale = params.locale as Locale;
    const t = (key: string) => getTranslation(locale, `subscriptions.${key}`);

    // Tabs state
    const [activeTab, setActiveTab] = useState('subscriptions');

    // Drawer state
    const [drawerType, setDrawerType] = useState<DrawerType>(null);
    const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);

    // Tabs configuration
    const tabs: Tab[] = [
        { id: 'subscriptions', label: 'الاشتراكات' },
        { id: 'financial-plans', label: 'حسابات الخطط المالية' },
        { id: 'custom-categories', label: 'الفئات الخاصة' },
    ];

    // Open add drawer
    const openAddDrawer = () => {
        setDrawerType('add');
        setSelectedPackage(null);
    };

    // Open edit drawer
    const openEditDrawer = (pkg: Package) => {
        setDrawerType('edit');
        setSelectedPackage(pkg);
    };

    // Close drawer
    const closeDrawer = () => {
        setDrawerType(null);
        setSelectedPackage(null);
    };

    // Handle delete
    const handleDelete = (pkgId: string) => {
        console.log('Delete package:', pkgId);
        // TODO: Implement delete logic
    };

    // Handle feature edit
    const handleFeatureEdit = (featureId: string) => {
        console.log('Edit feature:', featureId);
        // TODO: Implement feature edit logic
    };

    // Handle feature delete
    const handleFeatureDelete = (featureId: string) => {
        console.log('Delete feature:', featureId);
        // TODO: Implement feature delete logic
    };

    // Handle custom category edit
    const handleCategoryEdit = (categoryId: string) => {
        console.log('Edit category:', categoryId);
        // TODO: Implement category edit logic
    };

    // Handle custom category delete
    const handleCategoryDelete = (categoryId: string) => {
        console.log('Delete category:', categoryId);
        // TODO: Implement category delete logic
    };

    // Handle form submit
    const handleFormSubmit = (data: any) => {
        console.log('Form submitted:', data);
        // TODO: Implement submit logic
        closeDrawer();
    };

    return (
        <div className="space-y-6">
            {/* Tab Navigator */}
            <TabNavigator
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            {/* Subscriptions Tab Content */}
            {activeTab === 'subscriptions' && (
                <>
                    {/* Add Package Button */}
                    <div className="flex justify-end">
                        <Button onClick={openAddDrawer} variant="primary">
                            + إضافة خطة مالية
                        </Button>
                    </div>


                    {/* Packages Grid Container */}
                    <ContentContainer
                        showFilter
                        filterLabel="الأحدث"
                        onFilterClick={() => console.log('Filter clicked')}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {mockPackages.map((pkg) => (
                                <PackageCard
                                    key={pkg.id}
                                    id={pkg.id}
                                    badge={pkg.badge}
                                    badgeColor={pkg.badgeColor}
                                    price={pkg.price}
                                    description={pkg.description}
                                    features={pkg.features}
                                    isFeatured={pkg.isFeatured}
                                    onEdit={() => openEditDrawer(pkg)}
                                    onDelete={() => handleDelete(pkg.id)}
                                />
                            ))}
                        </div>
                    </ContentContainer>
                </>
            )}

            {/* Financial Plans Tab Content */}
            {activeTab === 'financial-plans' && (
                <>
                    {/* Add Feature Button */}
                    <div className="flex justify-end">
                        <Button onClick={openAddDrawer} variant="primary">
                            + إضافة خاصية
                        </Button>
                    </div>

                    {/* Features Grid Container */}
                    <ContentContainer
                        showFilter
                        filterLabel="الأحدث"
                        onFilterClick={() => console.log('Filter clicked')}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {mockFeatures.map((feature) => (
                                <FeatureCard
                                    key={feature.id}
                                    id={feature.id}
                                    price={feature.price}
                                    description={feature.description}
                                    isHighPrice={feature.isHighPrice}
                                    onEdit={() => handleFeatureEdit(feature.id)}
                                    onDelete={() => handleFeatureDelete(feature.id)}
                                />
                            ))}
                        </div>
                    </ContentContainer>
                </>
            )}

            {/* Custom Categories Tab Content */}
            {activeTab === 'custom-categories' && (
                <>
                    {/* Add Category Button */}
                    <div className="flex justify-end">
                        <Button onClick={openAddDrawer} variant="primary">
                            + إضافة فئة خاصة
                        </Button>
                    </div>

                    {/* Categories Grid Container */}
                    <ContentContainer
                        showFilter
                        filterLabel="الأحدث"
                        onFilterClick={() => console.log('Filter clicked')}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {mockCustomCategories.map((category) => (
                                <CustomCategoryCard
                                    key={category.id}
                                    id={category.id}
                                    name={category.name}
                                    email={category.email}
                                    price={category.price}
                                    features={category.features}
                                    onEdit={() => handleCategoryEdit(category.id)}
                                    onDelete={() => handleCategoryDelete(category.id)}
                                />
                            ))}
                        </div>
                    </ContentContainer>
                </>
            )}

            {/* Drawer */}
            <Drawer
                isOpen={!!drawerType}
                onClose={closeDrawer}
                title={
                    activeTab === 'financial-plans'
                        ? drawerType === 'add' ? 'إضافة خاصية مالية' : 'تعديل الخاصية'
                        : activeTab === 'custom-categories'
                            ? drawerType === 'add' ? 'إضافة خطة مالية خاصة' : 'تعديل الفئة الخاصة'
                            : drawerType === 'add' ? 'إضافة خطة مالية' : 'تعديل الخطة'
                }
                size="lg"
            >
                <DynamicForm
                    config={{
                        ...(activeTab === 'financial-plans'
                            ? featureFormConfig
                            : activeTab === 'custom-categories'
                                ? customCategoryFormConfig
                                : financialPlanFormConfig),
                        submitLabel: activeTab === 'financial-plans'
                            ? drawerType === 'add' ? 'إضافة خاصية مالية' : 'حفظ التعديلات'
                            : activeTab === 'custom-categories'
                                ? drawerType === 'add' ? 'إضافة خطة مالية' : 'حفظ التعديلات'
                                : drawerType === 'add' ? 'إضافة خطة مالية' : 'حفظ التعديلات'
                    }}
                    onSubmit={handleFormSubmit}
                    onCancel={closeDrawer}
                />
            </Drawer>
        </div>
    );
}
