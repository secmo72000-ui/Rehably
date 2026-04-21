'use client';

import React, { useState, useMemo } from 'react';
import { Button, GeneralInput, Checkbox } from '@/ui/primitives';
import { getTranslation } from '@/shared/i18n';
import type { Locale } from '@/configs/i18n.config';
import type { Permission, CreateRolePayload } from '@/domains/roles/roles.types';
import { getApiError } from '@/shared/utils';

interface RoleFormProps {
    allPermissions: Permission[];
    locale: Locale;
    onSubmit: (data: CreateRolePayload) => Promise<void>;
    isLoading?: boolean;
}

export function RoleForm({ allPermissions, locale, onSubmit, isLoading }: RoleFormProps) {
    const t = (key: string) => getTranslation(locale, `roles.${key}`);

    const [name, setName] = useState('');
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Group permissions by resource
    const groupedPermissions = useMemo(() => {
        const groups: Record<string, Permission[]> = {};
        allPermissions.forEach(p => {
            if (!groups[p.resource]) {
                groups[p.resource] = [];
            }
            groups[p.resource].push(p);
        });
        return groups;
    }, [allPermissions]);

    const resources = Object.keys(groupedPermissions);

    const handlePermissionToggle = (permName: string) => {
        setSelectedPermissions(prev =>
            prev.includes(permName)
                ? prev.filter(p => p !== permName)
                : [...prev, permName]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!name.trim()) {
            setError(t('validation.nameRequired') || 'Role name is required');
            return;
        }

        try {
            await onSubmit({
                name: name.trim(),
                permissions: selectedPermissions,
            });
        } catch (err) {
            setError(getApiError(err, 'Failed to create role'));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Name */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('form.roleName') || 'اسم الدور'}
                </label>
                <GeneralInput
                    type="text"
                    value={name}
                    onChange={setName}
                    placeholder={t('form.roleNamePlaceholder') || 'مثال : مساعد ادمن'}
                    error={error || undefined}
                />
            </div>

            {/* Permissions Grid */}
            <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700">{t('form.selectPermissions') || 'الصلاحيات'}</h3>

                <div className="max-h-96 overflow-y-auto border rounded-lg p-4 space-y-4">
                    {resources.map(resource => (
                        <div key={resource} className="border-b pb-3 last:border-b-0">
                            <h4 className="font-medium text-gray-800 mb-2 capitalize">{resource}</h4>
                            <div className="flex flex-wrap gap-3">
                                {groupedPermissions[resource].map((perm, index) => (
                                    <label
                                        key={`${resource}-${perm.action}-${index}`}
                                        className="flex items-center gap-2 cursor-pointer"
                                    >
                                        <Checkbox
                                            checked={selectedPermissions.includes(perm.name)}
                                            onChange={() => handlePermissionToggle(perm.name)}
                                        />
                                        <span className="text-sm text-gray-600">{perm.action}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Submit Button */}
            <Button
                type="submit"
                fullWidth
                isLoading={isLoading}
                disabled={isLoading}
            >
                {t('addRole') || 'اضافة دور'}
            </Button>
        </form>
    );
}
