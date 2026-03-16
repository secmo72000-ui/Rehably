import { cn } from "@/shared/utils/cn";
import { rtlTextAlign, rtlFlexReverse } from '@/shared/utils/rtl.utils';
import { Clinic, AddOnDto } from "@/domains/clinics/clinics.types";
import { PhoneIcon, UsersIcon, PackageIcon, LocationIcon, FileFolderIcon } from './icons';

interface InfoGridProps {
    clinic: Clinic;
    addons?: AddOnDto[];
    t: (key: string) => string;
    isRtl: boolean;
}

function PatientsIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    );
}

export function InfoGrid({ clinic, addons = [], t, isRtl }: InfoGridProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-6 pb-2">
            <div className={cn("flex items-center gap-3 col-span-1", isRtl ? "justify-start" : "justify-start flex-row-reverse")}>
                <div className="w-10 h-10 rounded-full bg-blue-50/50 flex items-center justify-center text-[#1da0f2]">
                    <PhoneIcon />
                </div>
                <span className="text-gray-600 font-medium tracking-wide">
                    {clinic.phone || t('details.notSpecified')}
                </span>
            </div>

            <div className={cn("flex items-center gap-3 col-span-1", isRtl ? "justify-start" : "justify-start flex-row-reverse")}>
                <div className="w-10 h-10 rounded-full bg-blue-50/50 flex items-center justify-center text-[#1da0f2]">
                    <UsersIcon />
                </div>
                <span className="text-gray-600 font-medium flex items-center gap-1" title={clinic.usersLimit ? `${t('details.total')}: ${clinic.usersLimit}` : ''}>
                    <span dir="ltr">
                        {clinic.usersLimit ? `${clinic.usersCount} / ${clinic.usersLimit}` : clinic.usersCount}
                    </span>
                    <span>{t('details.users')}</span>
                </span>
            </div>

            <div className={cn("flex items-center gap-3 col-span-1", isRtl ? "justify-start" : "justify-start flex-row-reverse")}>
                <div className="w-10 h-10 rounded-full bg-blue-50/50 flex items-center justify-center text-[#1da0f2]">
                    <PackageIcon />
                </div>
                <span className="text-gray-600 font-medium">
                    {clinic.subscriptionPlanName || t('details.noPlan')}
                </span>
            </div>

            <div className={cn("flex items-center gap-3 col-span-1", isRtl ? "justify-start" : "justify-start flex-row-reverse")}>
                <div className="w-10 h-10 rounded-full bg-blue-50/50 flex items-center justify-center text-[#1da0f2]">
                    <PatientsIcon />
                </div>
                <span className="text-gray-600 font-medium flex items-center gap-1" title={clinic.patientsLimit ? `${t('details.total')}: ${clinic.patientsLimit}` : ''}>
                    <span dir="ltr">
                        {clinic.patientsLimit ? `${clinic.patientsCount} / ${clinic.patientsLimit}` : clinic.patientsCount}
                    </span>
                    <span>{t('details.patients')}</span>
                </span>
            </div>

            {/* Row 2 - was Row 3 */}
            <div className={cn("flex items-center gap-3 col-span-1 lg:col-span-1 md:col-span-2", isRtl ? "justify-start" : "justify-start flex-row-reverse")}>
                <div className="w-10 h-10 rounded-full bg-blue-50/50 flex items-center justify-center text-[#1da0f2] flex-shrink-0">
                    <LocationIcon />
                </div>
                <span className="text-gray-600 font-medium px-1 truncate max-w-xs">
                    {clinic.address || t('details.defaultAddress')}
                </span>
            </div>

            <div className={cn("flex items-center gap-3 col-span-1 lg:col-span-2 md:col-span-2 flex-wrap", isRtl ? "justify-start" : "justify-start flex-row-reverse")}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center border border-blue-200/60 text-[#1da0f2] shadow-sm bg-white">
                    <FileFolderIcon />
                </div>

                {clinic.documents && clinic.documents.length > 0 ? (
                    clinic.documents.map((doc) => (
                        <a
                            key={doc.id}
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn("flex items-center gap-3 border border-blue-200/60 rounded-lg shadow-sm px-4 py-2 bg-white grow-0 hover:border-blue-400 transition-colors cursor-pointer", rtlFlexReverse(isRtl))}
                        >
                            <div className={cn("text-xs text-gray-500", rtlTextAlign(isRtl))}>
                                <div className="font-bold text-gray-700 text-sm mb-0.5">{doc.type}</div>
                                {doc.verificationStatus}
                            </div>
                            <div className="w-8 h-8 flex items-center justify-center rounded bg-red-50 text-red-500">
                                <img src="/Admin/ClinicDetails/PDF-icon.svg" alt="PDF" className="w-5 h-5 object-contain" />
                            </div>
                        </a>
                    ))
                ) : (
                    <span className="text-xs text-gray-400">{t('details.noDocuments')}</span>
                )}
            </div>
        </div>
    );
}
