/**
 * Mock Data for Subscriptions Page
 * 
 * This file contains temporary mock data for Features and Custom Categories
 * until the API endpoints are implemented.
 * 
 * TODO: Remove this file once API integration is complete
 */

// ========== Types ==========
export interface Feature {
    id: string;
    price: number;
    description: string;
    isHighPrice?: boolean;
}

export interface CustomCategory {
    id: string;
    name: string;
    email: string;
    price: number;
    features: Array<{ text: string; icon?: string }>;
}

// ========== Mock Data ==========
export const mockFeatures: Feature[] = [
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

export const mockCustomCategories: CustomCategory[] = [
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
