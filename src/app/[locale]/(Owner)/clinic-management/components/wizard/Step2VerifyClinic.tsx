'use client';

import React, { useRef, useState } from 'react';
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

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
const ACCEPTED_ACCEPT = 'image/jpeg,image/jpg,image/png,image/webp,application/pdf';

function formatFileSize(bytes: number): string {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileUploadField({
    label,
    hint,
    file,
    preview,
    onFileSelect,
    onClear,
    t,
}: {
    label: string;
    hint?: string;
    file: File | null;
    preview: string | null;
    onFileSelect: (file: File) => void;
    onClear: () => void;
    t: (key: string) => string;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const validateAndSelect = (selectedFile: File) => {
        setError(null);
        if (!ACCEPTED_TYPES.includes(selectedFile.type)) {
            setError(t('wizard.step2.errorInvalidType'));
            return;
        }
        if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
            setError(t('wizard.step2.errorFileTooLarge'));
            return;
        }
        onFileSelect(selectedFile);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) validateAndSelect(selectedFile);
        e.target.value = '';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => setIsDragging(false);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files?.[0];
        if (droppedFile) validateAndSelect(droppedFile);
    };

    const hasFile = !!file;
    const isPdf = file?.type === 'application/pdf';
    const isImage = file && file.type.startsWith('image/');

    const borderColor = error
        ? 'border-error-400 bg-error-50'
        : hasFile
        ? 'border-success-400 bg-success-50'
        : isDragging
        ? 'border-Primary-400 bg-Primary-50'
        : 'border-grey-200 hover:border-Primary-400 bg-white';

    return (
        <div>
            <label className="block text-sm font-medium text-grey-700 mb-1.5 text-start">
                {label}
            </label>

            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={!hasFile ? () => inputRef.current?.click() : undefined}
                className={`relative flex items-center border rounded-xl md:rounded-2xl py-2.5 md:py-3 px-4 transition-all ${borderColor} ${!hasFile ? 'cursor-pointer' : 'cursor-default'}`}
            >
                {/* Left icon */}
                <span className="px-2 shrink-0">
                    {hasFile && !error ? (
                        isPdf ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-error-500">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7 21H17a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-success-500">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        )
                    ) : error ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-error-500">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <circle cx="12" cy="16" r="0.5" fill="currentColor" />
                        </svg>
                    ) : (
                        <Image src="/shered/upload-icon.svg" alt="" width={20} height={20} onError={() => {}} />
                    )}
                </span>

                {/* File info / placeholder */}
                <div className="flex-1 min-w-0 text-start">
                    {hasFile ? (
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-grey-800 truncate">{file.name}</span>
                            <span className="text-xs text-grey-400">{formatFileSize(file.size)}</span>
                        </div>
                    ) : (
                        <span className="text-sm text-grey-400">
                            {isDragging ? t('wizard.step2.dropHere') : t('wizard.step2.uploadPlaceholder')}
                        </span>
                    )}
                </div>

                {/* Right: clear or browse */}
                {hasFile ? (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setError(null);
                            onClear();
                        }}
                        className="shrink-0 ms-2 p-1 rounded-md hover:bg-grey-100 text-grey-400 hover:text-error-500 transition-colors"
                        title={t('wizard.step2.removeFile')}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            inputRef.current?.click();
                        }}
                        className="shrink-0 ms-2 px-3 py-1 rounded-lg bg-Primary-50 text-Primary-600 text-xs font-medium hover:bg-Primary-100 transition-colors border border-Primary-200"
                    >
                        {t('wizard.step2.browse')}
                    </button>
                )}

                <input
                    ref={inputRef}
                    type="file"
                    accept={ACCEPTED_ACCEPT}
                    onChange={handleChange}
                    className="hidden"
                />
            </div>

            {/* Inline error */}
            {error && (
                <p className="mt-1.5 text-xs text-error-500 flex items-center gap-1 text-start">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                    </svg>
                    {error}
                </p>
            )}

            {/* Image preview */}
            {preview && isImage && (
                <div className="mt-2 rounded-lg overflow-hidden border border-grey-200 max-w-[200px]">
                    <Image src={preview} alt={label} width={200} height={120} className="object-cover" />
                </div>
            )}

            {/* Hint */}
            {hint && !error && (
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
            <FileUploadField
                label={t('wizard.step2.idCard')}
                hint={t('wizard.step2.idCardHint')}
                file={data.idCardFile}
                preview={data.idCardPreview}
                onFileSelect={handleIdCardSelect}
                onClear={() => { onChange('idCardFile', null); onChange('idCardPreview', null); }}
                t={t}
            />

            <FileUploadField
                label={t('wizard.step2.syndicateCard')}
                file={data.syndicateCardFile}
                preview={data.syndicateCardPreview}
                onFileSelect={handleSyndicateCardSelect}
                onClear={() => { onChange('syndicateCardFile', null); onChange('syndicateCardPreview', null); }}
                t={t}
            />
        </div>
    );
}
