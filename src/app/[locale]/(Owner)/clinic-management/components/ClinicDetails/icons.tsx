import React from 'react';

// SVG Icons from public folder or inline SVGs

export const PackageIcon = () => <img src="/Admin/ClinicDetails/Package.svg" alt="Package" />;

export const UsersIcon = () => <img src="/Admin/ClinicDetails/users.svg" alt="Users" />;

export const PhoneIcon = () => <img src="/Admin/ClinicDetails/phone.svg" alt="Phone" />;

export const LocationIcon = () => <img src="/Admin/ClinicDetails/location.svg" alt="Location" />;

export const CalendarIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);

export const CloudIcon = () => <img src="/Admin/ClinicDetails/storge.svg" alt="Storage" />;

export const FileFolderIcon = () => <img src="/Admin/ClinicDetails/Filei-con.svg" alt="File folder" />;
