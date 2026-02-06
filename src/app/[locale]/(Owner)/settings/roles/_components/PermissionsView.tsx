import React, { useMemo } from 'react';
import { DataRow, DataCell } from '@/ui/components/DataCell';
import { getTranslation } from '@/shared/i18n';
import type { Locale } from '@/configs/i18n.config';
import type { Role, Permission } from '@/domains/roles/roles.types';

interface PermissionsViewProps {
    /** Role to display permissions for (read-only mode) */
    role?: Role | null;
    /** All available permissions */
    allPermissions: Permission[];
    locale: Locale;
    /** If true, checkboxes are interactive */
    editable?: boolean;
    /** Selected permissions for editable mode */
    selectedPermissions?: string[];
    /** Callback when permission is toggled */
    onPermissionToggle?: (permName: string) => void;
}

export function PermissionsView({
    role,
    allPermissions,
    locale,
    editable = false,
    selectedPermissions = [],
    onPermissionToggle
}: PermissionsViewProps) {
    const t = (key: string) => getTranslation(locale, `roles.permissions.${key}`);

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

    // Check if permission is active
    const isPermissionChecked = (permName: string) => {
        if (editable) {
            return selectedPermissions.includes(permName);
        }
        return role?.permissions.includes(permName) || false;
    };

    // Show empty state only in non-editable mode when no role is selected
    if (!editable && !role) {
        return (
            <div className="flex items-center justify-center p-8 text-gray-500 border rounded-lg h-60">
                {getTranslation(locale, 'roles.selectRolePrompt') || 'Select a role to view permissions'}
            </div>
        );
    }

    const handleCheckboxClick = (permName: string) => {
        if (editable && onPermissionToggle) {
            onPermissionToggle(permName);
        }
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex gap-4">
                <div className="w-44" />
                <div className="flex-1">
                    <DataRow
                        className="rounded-lg py-2 px-6 border border-[#BBC5CE]"
                        gap="gap-8"
                        cells={[
                            { variant: 'text-with-badge', value: t('read') || 'قراءة', className: ' ' },
                            { variant: 'text-with-badge', value: t('edit') || 'تعديل', className: ' ' },
                            { variant: 'text-with-badge', value: t('delete') || 'أزالة', className: ' ' },
                        ]}
                        columns={3}
                    />
                </div>
            </div>

            {/* Permission Rows */}
            <div className="space-y-3">
                {resources.map((resource) => {
                    const viewPerm = groupedPermissions[resource].find(p => p.action === 'view');
                    // Map create to update/edit column
                    const updatePerm = groupedPermissions[resource].find(p => p.action === 'update')
                        || groupedPermissions[resource].find(p => p.action === 'create');
                    const deletePerm = groupedPermissions[resource].find(p => p.action === 'delete');

                    // Unique keys for checkboxes to avoid React reconciliation issues
                    const viewKey = viewPerm ? `${resource}-view` : `empty-view-${resource}`;
                    const updateKey = updatePerm ? `${resource}-update` : `empty-update-${resource}`;
                    const deleteKey = deletePerm ? `${resource}-delete` : `empty-delete-${resource}`;

                    return (
                        <div key={resource} className="flex gap-4 items-stretch">
                            {/* Label Cell */}
                            <div className="w-44">
                                <DataCell
                                    variant="text"
                                    value={t(resource) || resource}
                                    className="bg-white border border-[#BBC5CE] rounded-lg p-4 h-full text-center items-center font-medium"
                                />
                            </div>
                            {/* DataRow for the checkboxes */}
                            <div className="flex-1">
                                <DataRow
                                    className="bg-white border border-[#BBC5CE] rounded-lg p-4 h-full"
                                    columns={3}
                                    cells={[
                                        {
                                            // Ensure unique key for the cell if DataCell/DataRow supported it directly, but relying on stability
                                            variant: 'checkbox',
                                            checked: viewPerm ? isPermissionChecked(viewPerm.name) : false,
                                            className: editable && viewPerm ? 'items-center cursor-pointer' : 'items-center pointer-events-none',
                                            onChange: viewPerm ? () => handleCheckboxClick(viewPerm.name) : undefined
                                        },
                                        {
                                            variant: 'checkbox',
                                            checked: updatePerm ? isPermissionChecked(updatePerm.name) : false,
                                            className: editable && updatePerm ? 'items-center cursor-pointer' : 'items-center pointer-events-none',
                                            onChange: updatePerm ? () => handleCheckboxClick(updatePerm.name) : undefined
                                        },
                                        {
                                            variant: 'checkbox',
                                            checked: deletePerm ? isPermissionChecked(deletePerm.name) : false,
                                            className: editable && deletePerm ? 'items-center cursor-pointer' : 'items-center pointer-events-none',
                                            onChange: deletePerm ? () => handleCheckboxClick(deletePerm.name) : undefined
                                        },
                                    ]}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
