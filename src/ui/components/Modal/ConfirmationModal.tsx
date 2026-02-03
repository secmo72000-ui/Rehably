"use client";

import { ReactNode } from "react";
import { Modal } from "./Modal";
import { Button } from "@/ui/primitives";
import { cn } from "@/shared/utils/cn";

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    children?: ReactNode;
    confirmText?: string;
    cancelText?: string;
    isLoading?: boolean;
    variant?: "primary" | "danger" | "warning";
    status?: "idle" | "success" | "error";
    successMessage?: string;
    errorMessage?: string;
    successButtonText?: string;
    retryButtonText?: string;
    successTitle?: string;
    errorTitle?: string;
}

export function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    children,
    confirmText = "تأكيد",
    cancelText = "إلغاء",
    isLoading = false,
    variant = "primary",
    status = "idle",
    successMessage = "تمت العملية بنجاح",
    errorMessage = "حدث خطأ أثناء العملية",
    successButtonText = "حسناً",
    retryButtonText = "المحاولة مرة أخرى",
    successTitle,
    errorTitle
}: ConfirmationModalProps) {

    const getConfirmButtonVariant = () => {
        switch (variant) {
            case "danger": return "danger"; // Assuming Button supports 'danger' or simply use styling below if not
            case "warning": return "warning";
            default: return "primary";
        }
    };

    // Success State
    if (status === "success") {
        return (
            <Modal isOpen={isOpen} onClose={onClose} width="max-w-[500px]">
                <div className="text-center py-6">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                        <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{successTitle || "تم بنجاح!"}</h3>
                    <p className="text-gray-600 mb-8">{successMessage}</p>
                    <Button
                        onClick={onClose}
                        variant="primary"
                        fullWidth
                    >
                        {successButtonText}
                    </Button>
                </div>
            </Modal>
        );
    }

    // Error State
    if (status === "error") {
        return (
            <Modal isOpen={isOpen} onClose={onClose} width="max-w-[500px]">
                <div className="text-center py-6">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                        <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{errorTitle || "حدث خطأ!"}</h3>
                    <p className="text-red-600 mb-8 px-4">{errorMessage}</p>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-[#F4F5F7] text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                        >
                            {cancelText}
                        </button>
                        <Button
                            onClick={onConfirm}
                            variant="primary"
                            fullWidth
                            className="flex-1"
                            isLoading={isLoading}
                            disabled={isLoading}
                        >
                            {retryButtonText}
                        </Button>
                    </div>
                </div>
            </Modal>
        );
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} width="max-w-[500px]">
            {/* Header with Close Icon */}
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

            </div>

            {/* Content */}
            <div className="text-center mb-8">
                {children}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
                <button
                    onClick={onClose}
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 bg-[#F4F5F7] text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
                >
                    {cancelText}
                </button>
                <Button
                    onClick={onConfirm}
                    isLoading={isLoading}
                    disabled={isLoading}
                    variant={getConfirmButtonVariant() as any}
                    fullWidth
                    className="flex-1"
                >
                    {confirmText}
                </Button>

            </div>
        </Modal>
    );
}
