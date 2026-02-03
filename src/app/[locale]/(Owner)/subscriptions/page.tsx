'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { getTranslation } from '@/shared/i18n';
import type { Locale } from '@/configs/i18n.config';
import {
    TabNavigator,
    PackageCard,
    Drawer,
    ContentContainer,
    DynamicForm,
    ConfirmationModal,
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
import { usePackagesStore } from '@/stores/packages.store';
import { useFeaturesStore } from '@/stores/features.store';
import type { Package as PackageType, CreatePackageRequest } from '@/services/packages.service';

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

// ========== Helper Functions ==========

// Map displayOrder to badge color
const getBadgeColor = (displayOrder: number): 'blue' | 'green' | 'gray' => {
    switch (displayOrder) {
        case 1: return 'gray';   // Starter
        case 2: return 'blue';   // Pro
        case 3: return 'green';  // Enterprise
        default: return 'gray';
    }
};

// Transform API package to local Package type
const transformPackage = (pkg: PackageType): Package => ({
    id: String(pkg.id),
    badge: pkg.name,
    badgeColor: getBadgeColor(pkg.displayOrder),
    price: pkg.monthlyPrice,
    description: pkg.description,
    features: [
        { text: `فترة تجريبية: ${pkg.trialDays} يوم` },
        { text: `السعر السنوي: ${pkg.yearlyPrice} جنيها` },
    ],
    isFeatured: pkg.displayOrder === 2, // Pro is featured
});

// ========== Page Component ==========
export default function SubscriptionsPage() {
    const params = useParams();
    const locale = params.locale as Locale;
    const t = (key: string) => getTranslation(locale, `subscriptions.${key}`);

    // Store
    const { packages, isLoading, isCreating, error, fetchPackages, archivePackage, createPackage } = usePackagesStore();
    const { features, fetchFeatures } = useFeaturesStore();

    // Fetch packages and features on mount
    useEffect(() => {
        fetchPackages();
        fetchFeatures();
    }, [fetchPackages, fetchFeatures]);

    // Map features to options
    const featureOptions = useMemo(() => {
        return features.map(f => ({
            value: String(f.id),
            label: f.description || f.name // Use description as label if available, else name
        }));
    }, [features]);

    // Dynamic Form Config
    const dynamicFinancialPlanConfig = useMemo(() => {
        const config = { ...financialPlanFormConfig };
        // Find the planFeatures field and update its options
        const rows = config.rows.map(row => ({
            ...row,
            fields: row.fields.map(field => {
                if (field.name === 'planFeatures') {
                    return { ...field, options: featureOptions };
                }
                return field;
            })
        }));
        return { ...config, rows };
    }, [featureOptions]);

    // Tabs state
    const [activeTab, setActiveTab] = useState('subscriptions');

    // Drawer state
    const [drawerType, setDrawerType] = useState<DrawerType>(null);
    const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);

    // Delete confirmation modal state
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [packageToDelete, setPackageToDelete] = useState<string | null>(null);
    const [deleteStatus, setDeleteStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [deleteErrorMessage, setDeleteErrorMessage] = useState('');

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

    // Handle delete - open confirmation modal
    const handleDelete = (pkgId: string) => {
        setPackageToDelete(pkgId);
        setDeleteStatus('idle');
        setDeleteErrorMessage('');
        setDeleteModalOpen(true);
    };

    // Confirm delete
    const confirmDelete = async () => {
        if (packageToDelete) {
            const success = await archivePackage(Number(packageToDelete));
            if (success) {
                setDeleteStatus('success');
            } else {
                setDeleteStatus('error');
                setDeleteErrorMessage(error || 'حدث خطأ أثناء حذف الباقة');
            }
        }
    };

    // Close delete modal
    const closeDeleteModal = () => {
        setDeleteModalOpen(false);
        // Delay clearing state to allow transition
        setTimeout(() => {
            setPackageToDelete(null);
            setDeleteStatus('idle');
        }, 300);
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

    // Handle add package
    const handleAddPackage = async (data: any) => {
        // Transform form data to CreatePackageRequest
        // The form returns:
        // planName, planDetails, planFeatures (array of IDs), fullPrice, minimumPrice

        // Default values as per requirements
        const request: CreatePackageRequest = {
            name: data.planName,
            description: data.planDetails,
            monthlyPrice: Number(data.fullPrice),
            yearlyPrice: Number(data.fullPrice) * 10, // Assuming 10 months for yearly or similar rule, or maybe 12. User passed 0 in example.
            // The user curl example had 0.
            // Let's assume yearly is monthly * 12 for now or user input? 
            // Form has "minimumPrice" -> maybe that's monthly?
            // The form fields are: "fullPrice" (السعر الكامل), "minimumPrice" (السعر الأدنى)
            // Let's assume "fullPrice" is monthlyPrice.
            trialDays: 14, // Default
            features: (data.planFeatures || []).map((featureId: string) => ({
                featureId: Number(featureId), // The multiselect returns values (IDs)
                quantity: 0,
                calculatedPrice: 0,
                isIncluded: true
            })),
            isPublic: true,
            isCustom: false, // Adding standard plan
            displayOrder: 0,
            code: String(Math.floor(Math.random() * 1000)), // Random code for now
        };

        const success = await createPackage(request);
        if (success) {
            closeDrawer();
        }
    };

    // Handle form submit
    const handleFormSubmit = (data: any) => {
        if (activeTab === 'subscriptions' && drawerType === 'add') {
            handleAddPackage(data);
        } else {
            console.log('Form submitted:', data);
            // TODO: Implement other submit logic
            closeDrawer();
        }
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
                        {isLoading ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-Primary-500"></div>
                            </div>
                        ) : error ? (
                            <div className="text-center py-12 text-red-500">{error}</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {packages.map((apiPkg) => {
                                    const pkg = transformPackage(apiPkg);
                                    return (
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
                                    );
                                })}
                            </div>
                        )}
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
                                : dynamicFinancialPlanConfig),
                        submitLabel: activeTab === 'financial-plans'
                            ? drawerType === 'add' ? 'إضافة خاصية مالية' : 'حفظ التعديلات'
                            : activeTab === 'custom-categories'
                                ? drawerType === 'add' ? 'إضافة خطة مالية' : 'حفظ التعديلات'
                                : drawerType === 'add' ? 'إضافة خطة مالية' : 'حفظ التعديلات'
                    }}
                    onSubmit={handleFormSubmit}
                    onCancel={closeDrawer}
                    isLoading={isCreating}
                />
            </Drawer>

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={deleteModalOpen}
                onClose={closeDeleteModal}
                onConfirm={confirmDelete}
                title="ازالة خطة مالية"
                confirmText="ازالة الخطة"
                cancelText="الغاء"
                variant="primary" // Blue as per image
                isLoading={isLoading} // From store
                status={deleteStatus}
                errorMessage={deleteErrorMessage}
                successMessage="تم حذف الخطة المالية بنجاح"
                successButtonText="حسناً"
                retryButtonText="المحاولة مرة أخرى"
            >
                <p className="text-gray-600 text-lg">
                    هل تريد حقا القيام بازالة الخطة المالية
                </p>
            </ConfirmationModal>
        </div>
    );
}
