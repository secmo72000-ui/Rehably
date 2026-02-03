"use client";

import { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/shared/utils/cn";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
    width?: string;
}

export function Modal({ isOpen, onClose, children, width = "max-w-md" }: ModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal Panel */}
            <div
                className={cn(
                    "relative bg-white rounded-xl shadow-xl w-full mx-auto p-6 transform transition-all",
                    width
                )}
                role="dialog"
                aria-modal="true"
            >
                {children}
            </div>
        </div>,
        document.body
    );
}
