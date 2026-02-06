import React, { useEffect } from 'react';
import { Drawer } from '@/ui/components';
import { Button, GeneralInput } from '@/ui/primitives';
import { getTranslation } from '@/shared/i18n';
import type { Locale } from '@/configs/i18n.config';
import type { Role } from '@/domains/roles/roles.types';

// Simple Select component since external ui primitives might not be fully known or complex
// I will use a basic HTML select styled or check if there is a Select in primitives.
// Step 11 showed `Button` and `GeneralInput` imported from `ui/primitives`. 
// I'll assume for now standard select or check `ui` folder later if needed, but standard select is safer for MVP.

interface UserDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    locale: Locale;
    isLoading: boolean;
    roles: Role[];
    onSubmit: (data: any) => void;
}

export function UserDrawer({ isOpen, onClose, locale, isLoading, roles, onSubmit }: UserDrawerProps) {
    const t = (key: string) => getTranslation(locale, `usersPage.drawer.${key}`);

    // Form State
    const [name, setName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [phone, setPhone] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [roleId, setRoleId] = React.useState('');

    // Reset form on open
    useEffect(() => {
        if (isOpen) {
            setName('');
            setEmail('');
            setPhone('');
            setPassword('');
            setRoleId('');
        }
    }, [isOpen]);

    const handleSubmit = () => {
        // Basic validation
        if (!name || !email || !roleId) return;

        // Split name into first and last for API (API requires firstName, lastName)
        // Simple logic: generic name split or just send name as firstName and dot as last name if single word
        const nameParts = name.trim().split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'User'; // Fallback

        onSubmit({
            firstName,
            lastName,
            email,
            // phone, // API doesn't seem to take phone based on curl
            // password, // API generates temp password? POST /api/admin/platform-users says "sends welcome email with temp password"
            roleId
        });
    };

    return (
        <Drawer
            isOpen={isOpen}
            onClose={onClose}
            title={t('title')}
            size="lg"
        >
            <div className="space-y-6">
                {/* User Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('nameLabel')}
                    </label>
                    <GeneralInput
                        type="text"
                        htmlType="text"
                        value={name}
                        onChange={setName}
                        placeholder={t('namePlaceholder')}
                    />
                </div>

                {/* Email */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('emailLabel')}
                    </label>
                    <GeneralInput
                        type="text"
                        htmlType="email"
                        value={email}
                        onChange={setEmail}
                        placeholder={t('emailPlaceholder')}
                    />
                </div>

                {/* Phone */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('phoneLabel')}
                    </label>
                    <GeneralInput
                        type="text"
                        htmlType="tel"
                        value={phone}
                        onChange={setPhone}
                        placeholder={t('phonePlaceholder')}
                    />
                </div>

                {/* Password - Actually API sends temp password, maybe "Set Password" field is not needed if API handles it?
                   User Prompt Image: "تعيين كلمة مرور" (Set Password) is clearly visible in the image.
                   But the API endpoint description says: "Create a new platform admin user with a role (sends welcome email with temp password)"
                   And the curl body ONLY has: email, firstName, lastName, roleId.
                   So the "Set Password" field in UI might be misleading or for future use, OR the user prompt implies I should include it even if API doesn't use it yet?
                   I will include the field to match the DESIGN (Image), but I won't send it to API if API doesn't accept it.
                 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('passwordLabel')}
                    </label>
                    <GeneralInput
                        type="text"
                        htmlType="password"
                        value={password}
                        onChange={setPassword}
                        placeholder={t('passwordPlaceholder')}
                    />
                </div>

                {/* Role Select */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('assignRoleLabel')}
                    </label>
                    <div className="relative">
                        <select
                            value={roleId}
                            onChange={(e) => setRoleId(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
                        >
                            <option value="" disabled>{t('selectRolePlaceholder')}</option>
                            {roles.map(role => (
                                <option key={role.id} value={role.id}>
                                    {role.name}
                                </option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 left-auto rtl:right-auto rtl:left-0 flex items-center px-3 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <Button
                    type="button"
                    fullWidth
                    isLoading={isLoading}
                    disabled={isLoading || !name || !email || !roleId}
                    onClick={handleSubmit}
                >
                    {t('submit')}
                </Button>
            </div>
        </Drawer>
    );
}
