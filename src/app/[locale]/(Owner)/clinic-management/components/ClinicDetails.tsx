"use client";

import { UserProfile } from "@/ui/components";
import { GeneralInput } from "@/ui/primitives";
import { InfoCard } from "./InfoCard";

interface Clinic {
    id: string;
    name: string;
    email?: string;
    managerName?: string;
    phone?: string;
    package: string;
    location?: string;
    subscriptionDate: string;
    expiryDate: string;
    paymentStatus: "paid" | "unpaid" | "suspended" | "refunded";
    doctorsCount: number;
    storageUsed?: number;
    storageTotal?: number;
}

interface ClinicDetailsProps {
    clinic: Clinic | null;
    onBlock?: () => void;
    onSendNotification?: () => void;
}

export function ClinicDetails({
    clinic,
    onBlock,
    onSendNotification,
}: ClinicDetailsProps) {
    if (!clinic) return null;

    // Calculate storage percentage
    const storageUsed = clinic.storageUsed || 50;
    const storageTotal = clinic.storageTotal || 100;
    const storagePercentage = Math.round((storageUsed / storageTotal) * 100);

    // Info cards data
    const infoCards = [
        {
            iconSrc: "/shered/users.svg",
            label: `${clinic.doctorsCount} مستخدم`,
            iconAlt: "Users",
        },
        {
            iconSrc: "/shered/Package.svg",
            label: clinic.package,
            iconAlt: "Package",
        },
        {
            iconSrc: "/shered/location.svg",
            label: clinic.location || "القاهرة",
            iconAlt: "Location",
        },
        {
            iconSrc: "/shered/phone.svg",
            label: clinic.phone || "01000000000",
            iconAlt: "Phone",
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header with UserProfile */}
            <div className="pb-4 flex justify-start items-center ">
                <UserProfile name={clinic.name} email={clinic.email || ""} size="md" />
            </div>

            {/* Info Grid */}
            <div className="space-y-4">
                {/* Manager Name - Read-only GeneralInput */}
                {clinic.managerName && (
                    <div>
                        <p className="text-sm text-gray-500 mb-1 text-right">
                            مدير العيادة
                        </p>
                        <GeneralInput
                            value={clinic.managerName}
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
                        <h3 className="text-2xl font-bold text-cyan-600 mb-1">
                            {storagePercentage}% ممتلئ
                        </h3>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                            <span className="direction-ltr">
                                {storageUsed}GB of {storageTotal}GB used
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4 pt-4">
                <button
                    onClick={onBlock}
                    className="px-4 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                    حظر العيادة
                </button>
                <button
                    onClick={onSendNotification}
                    className="px-4 py-3 rounded-lg bg-Primary-500 hover:bg-Primary-600 text-white transition-colors font-medium"
                >
                    إرسال إشعار
                </button>
            </div>
        </div>
    );
}
