"use client";

import { useParams } from 'next/navigation';
import { useClinicsStore } from '@/stores/clinics.store';
import { getTranslation } from '@/shared/i18n';
import type { Locale } from '@/configs/i18n.config';
import { UserProfile } from "@/ui/components";
import { GeneralInput } from "@/ui/primitives";
import { InfoCard } from "./InfoCard";
import { Clinic } from "@/domains/clinics/clinics.types";
import { cn } from "@/shared/utils/cn";

interface ClinicDetailsProps {
    clinic: Clinic | null;
    onSendNotification?: () => void;
    onDelete?: () => void;
}

/**
 * Convert bytes to GB with 2 decimal places
 */
const bytesToGB = (bytes: number): number => {
    return Math.round((bytes / (1024 * 1024 * 1024)) * 100) / 100;
};

export function ClinicDetails({
    clinic,
    onSendNotification,
    onDelete,
}: ClinicDetailsProps) {
    const params = useParams();
    const locale = params.locale as Locale;
    const t = (key: string) => getTranslation(locale, `clinicManagement.${key}`);

    const { toggleClinicStatus, isTogglingStatus } = useClinicsStore();

    if (!clinic) return null;

    // Check status: 1 = Active, Others = Suspended (as per requirement 1 means Active)
    const isActive = clinic.subscriptionStatus === 1;

    const handleToggleStatus = async () => {
        if (clinic) {
            await toggleClinicStatus(clinic.id, clinic.subscriptionStatus);
        }
    };

    // Calculate storage percentage
    const storageUsedGB = bytesToGB(clinic.storageUsedBytes);
    const storageTotalGB = bytesToGB(clinic.storageLimitBytes);
    const storagePercentage = clinic.storageUsedPercentage || 0;

    // Info cards data
    const infoCards = [
        {
            iconSrc: "/shered/users.svg",
            label: `${clinic.usersCount} ${t('details.user')}`,
            iconAlt: "Users",
        },
        {
            iconSrc: "/shered/Package.svg",
            label: clinic.subscriptionPlanName || t('details.noPlan'),
            iconAlt: "Package",
        },
        {
            iconSrc: "/shered/location.svg",
            label: clinic.city || clinic.country || t('details.notSpecified'),
            iconAlt: "Location",
        },
        {
            iconSrc: "/shered/phone.svg",
            label: clinic.phone || t('details.notSpecified'),
            iconAlt: "Phone",
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header with UserProfile */}
            <div className="pb-4 flex justify-start items-center ">
                <UserProfile
                    name={clinic.nameArabic || clinic.name}
                    email={clinic.email || ""}
                    size="md"
                />
            </div>

            {/* Info Grid */}
            <div className="space-y-4">
                {/* Description - Read-only GeneralInput */}
                {clinic.description && (
                    <div>
                        <p className="text-sm text-gray-500 mb-1 text-right">
                            {t('details.description')}
                        </p>
                        <GeneralInput
                            value={clinic.description}
                            onChange={() => { }}
                            readOnly
                        />
                    </div>
                )}

                {/* Address - Read-only GeneralInput */}
                {clinic.address && (
                    <div>
                        <p className="text-sm text-gray-500 mb-1 text-right">
                            {t('details.address')}
                        </p>
                        <GeneralInput
                            value={clinic.address}
                            onChange={() => { }}
                            readOnly
                        />
                    </div>
                )}

                {/* Info Cards Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {infoCards.map((card, index) => (
                        <InfoCard
                            key={index}
                            iconSrc={card.iconSrc}
                            label={card.label}
                            iconAlt={card.iconAlt}
                        />
                    ))}
                </div>
            </div>

            {/* Patients & Users Limits */}
            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-blue-50">
                    <p className="text-sm text-blue-600 mb-1">{t('details.patients')}</p>
                    <p className="text-xl font-bold text-blue-700">
                        {clinic.patientsCount} / {clinic.patientsLimit ?? '∞'}
                    </p>
                    {clinic.patientsLimit && (
                        <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                            <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${clinic.patientsUsedPercentage}%` }}
                            />
                        </div>
                    )}
                </div>
                <div className="p-4 rounded-lg bg-purple-50">
                    <p className="text-sm text-purple-600 mb-1">{t('details.users')}</p>
                    <p className="text-xl font-bold text-purple-700">
                        {clinic.usersCount} / {clinic.usersLimit ?? '∞'}
                    </p>
                    {clinic.usersLimit && (
                        <div className="w-full bg-purple-200 rounded-full h-2 mt-2">
                            <div
                                className="bg-purple-600 h-2 rounded-full"
                                style={{ width: `${clinic.usersUsedPercentage}%` }}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Storage Progress */}
            <div className="rounded-lg p-5" style={{ backgroundColor: "#04EED733" }}>
                <div className="flex items-center mb-3 gap-2">
                    {/* Circular Progress */}
                    <div className="relative w-16 h-16 flex-shrink-0">
                        <svg className="w-16 h-16 transform -rotate-90">
                            <circle
                                cx="32"
                                cy="32"
                                r="28"
                                stroke="currentColor"
                                strokeWidth="6"
                                fill="none"
                                className="text-cyan-200"
                            />
                            <circle
                                cx="32"
                                cy="32"
                                r="28"
                                stroke="currentColor"
                                strokeWidth="6"
                                fill="none"
                                strokeDasharray={`${storagePercentage * 1.76} 176`}
                                className="text-cyan-500"
                            />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-4xl-bold text-text mb-1">
                            {storagePercentage}{t('details.storageFull')}
                        </h3>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                            <span className="direction-ltr">
                                {t('details.storageUsage')
                                    .replace('{used}', storageUsedGB.toString())
                                    .replace('{total}', storageTotalGB.toString())}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4 pt-4">
                <button
                    onClick={handleToggleStatus}
                    disabled={isTogglingStatus}
                    className={cn(
                        "px-4 py-3 rounded-lg border transition-colors font-medium flex justify-center items-center",
                        isActive
                            ? "border-red-200 text-red-600 hover:bg-red-50"
                            : "border-green-200 text-green-600 hover:bg-green-50",
                        isTogglingStatus && "opacity-50 cursor-not-allowed"
                    )}
                >
                    {isTogglingStatus ? t('common.loading') : (isActive ? t('suspendClinic') : t('activateClinic'))}
                </button>
                <button
                    onClick={onSendNotification}
                    className="px-4 py-3 rounded-lg bg-Primary-500 hover:bg-Primary-600 text-white transition-colors font-medium"
                >
                    {t('details.sendNotification')}
                </button>
            </div>
        </div>
    );
}
