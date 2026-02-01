# Rehably - Clinic Management System

<div align="center">

![Rehably Logo](https://img.shields.io/badge/Rehably-Clinic%20Management-0EA5E9?style=for-the-badge)

**A comprehensive clinic management system for rehabilitation and physiotherapy centers**

[![Next.js](https://img.shields.io/badge/Next.js-16+-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4+-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![React](https://img.shields.io/badge/React-19+-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)

[العربية](#arabic) | [English](#english)

</div>

---

<a name="english"></a>

## 🏥 About

Rehably is a full-featured clinic management platform designed specifically for rehabilitation and physiotherapy centers. It provides three dedicated portals for different user roles.

## ✨ Features

### 🔐 Three Portals

| Portal | Users | Description |
|--------|-------|-------------|
| **Owner Portal** | Platform Owner | Manage clinics, subscriptions, billing |
| **Clinic Portal** | Clinic Staff | Manage patients, appointments, doctors |
| **Patient Portal** | Patients | Book appointments, view exercises |

### 👥 User Roles

- **Platform Owner** - Full system control
- **Clinic Owner** - Full clinic control
- **Clinic Admin** - Staff & branch management
- **Doctor** - Patient care & SOAP notes
- **Receptionist** - Appointments & check-in
- **Patient** - Self-service portal

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | TailwindCSS 4 |
| State | Zustand |
| Auth | NextAuth.js + JWT |
| i18n | next-intl |
| Forms | React Hook Form + Zod |

## 📁 Project Structure

```
src/
├── app/[locale]/           # Next.js App Router + i18n
│   ├── (auth)/            # Authentication pages
│   ├── (owner)/           # Owner portal
│   ├── (clinic)/          # Clinic portal
│   └── (patient)/         # Patient portal
├── domains/               # Business logic
├── permissions/           # RBAC system
├── services/              # API layer
├── ui/                    # Design system
├── shared/                # Utilities
├── stores/                # Zustand stores
└── configs/               # Configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/KaEssam/Rehably-Frontend.git
cd Rehably-Frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📝 Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

<a name="arabic"></a>

## 🏥 عن المشروع

Rehably هو نظام متكامل لإدارة عيادات إعادة التأهيل والعلاج الطبيعي.

## ✨ المميزات

- ✅ دعم متعدد العيادات
- ✅ نظام صلاحيات متقدم
- ✅ جدولة المواعيد
- ✅ مكتبة تمارين مع فيديو
- ✅ الفواتير والمدفوعات
- ✅ عربي وإنجليزي (RTL)
- ✅ الوضع الداكن

---

## 📄 License

This project is private and proprietary.

---

<div align="center">

**Made with ❤️ for better healthcare management**

</div>
