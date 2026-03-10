'use client';

import React, { useRef } from 'react';
import Image from 'next/image';

export interface Step2Data {
    idCardFile: File | null;
    idCardPreview: string | null;
    syndicateCardFile: File | null;
    syndicateCardPreview: string | null;
}

interface Step2Props {
    data: Step2Data;
    onChange: (field: keyof Step2Data, value: File | string | null) => void;
    t: (key: string) => string;
}

function FileUploadField({
    label,
    hint,
    file,
    preview,
    onFileSelect,
    t,
}: {
    label: string;
    hint?: string;
    file: File | null;
    preview: string | null;
    onFileSelect: (file: File) => void;
    t: (key: string) => string;
}) {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleClick = () => {
        inputRef.current?.click();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            onFileSelect(selectedFile);
        }
    };

    return (
        <div>
            <label className="block text-sm font-medium text-grey-700 mb-1.5 text-start">
                {label}
            </label>
            <div
                onClick={handleClick}
                className="relative flex items-center border border-grey-200 rounded-xl md:rounded-2xl py-2.5 md:py-3 px-4 cursor-pointer hover:border-Primary-400 transition-colors bg-white"
            >
                {/* Upload icon */}
                <span className="text-grey-400 px-2">
                    <Image src="/shered/upload-icon.svg" alt="" width={20} height={20}
                        onError={() => { }} />
                </span>

                {/* File name or placeholder */}
                <span className="flex-1 text-start text-sm text-grey-400 me-3">
                    {file ? file.name : t('wizard.step2.uploadPlaceholder')}
                </span>

                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleChange}
                    className="hidden"
                />
            </div>

            {/* Preview */}
            {preview && (
                <div className="mt-2 rounded-lg overflow-hidden border border-grey-200 max-w-[200px]">
                    <Image src={preview} alt={label} width={200} height={120} className="object-cover" />
                </div>
            )}

            {/* Hint */}
            {hint && (
                <p className="mt-1 text-xs text-grey-400 text-start">{hint}</p>
            )}
        </div>
    );
}

export function Step2VerifyClinic({ data, onChange, t }: Step2Props) {
    const handleIdCardSelect = (file: File) => {
        onChange('idCardFile', file);
        const reader = new FileReader();
        reader.onload = (e) => {
            onChange('idCardPreview', e.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSyndicateCardSelect = (file: File) => {
        onChange('syndicateCardFile', file);
        const reader = new FileReader();
        reader.onload = (e) => {
            onChange('syndicateCardPreview', e.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="space-y-6">
            {/* صورة البطاقة الشخصية */}
            <FileUploadField
                label={t('wizard.step2.idCard')}
                hint={t('wizard.step2.idCardHint')}
                file={data.idCardFile}
                preview={data.idCardPreview}
                onFileSelect={handleIdCardSelect}
                t={t}
            />

            {/* صورة كارنيه النقابة */}
            <FileUploadField
                label={t('wizard.step2.syndicateCard')}
                file={data.syndicateCardFile}
                preview={data.syndicateCardPreview}
                onFileSelect={handleSyndicateCardSelect}
                t={t}
            />
        </div>
    );
}
