<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# IISBenin CBT - Computer-Based Testing Platform

[![WCAG 2.1 AA](https://img.shields.io/badge/WCAG-2.1%20AA-green)](./ACCESSIBILITY.md)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.1.0-brightgreen)](./CHANGELOG.md)

> **Secure online examination system for Indian International School Benin**

A modern, accessible, and feature-rich computer-based testing platform built with React, TypeScript, and Supabase.

## ✨ Key Features

- 🎓 **Role-Based Access**: Student, Teacher, and Admin dashboards
- 🤖 **AI-Powered**: Gemini AI for question generation and performance feedback
- ♿ **Accessible**: WCAG 2.1 AA compliant with full keyboard and screen reader support
- 🎨 **Modern UI**: Professional design with toast notifications and smooth animations
- 🔒 **Secure**: PIN-based authentication with Supabase backend
- 📱 **Responsive**: Works seamlessly on desktop, tablet, and mobile devices
- 🌍 **Official Branding**: Indian International School Benin logo integration

## 📚 Documentation

- [📖 Quick Start Guide](./QUICK_START.md) - Get started quickly
- [♿ Accessibility Guide](./ACCESSIBILITY.md) - WCAG compliance details
- [📋 Implementation Summary](./IMPLEMENTATION_SUMMARY.md) - Technical changes
- [📝 Changelog](./CHANGELOG.md) - Version history
- [🗄️ Supabase Setup](./README_SUPABASE.md) - Database configuration

---

## Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1eWjN5TNt8AeDRC4hzI44qRqZu0EFa7rx

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   ```bash
   npm run dev
   ```

## 🚀 What's New in v1.1.0

### Accessibility Enhancements
- ✅ **WCAG 2.1 AA Compliant**: Full keyboard navigation and screen reader support
- ✅ **Skip Navigation**: Bypass blocks for faster navigation
- ✅ **ARIA Labels**: Comprehensive screen reader announcements
- ✅ **Focus Indicators**: Visible focus states on all interactive elements

### New Features
- 🔔 **Toast Notifications**: Success, error, warning, and info messages
- 🏫 **Official Logo**: Indian International School Benin branding throughout
- 📋 **Empty States**: Friendly messages when no data is available
- ⌨️ **Keyboard Support**: Full keyboard navigation with visible focus

See [CHANGELOG.md](./CHANGELOG.md) for complete details.

---

## 🎮 Demo Credentials

### Student Login
- **ID**: `IIS-2024-001` | **PIN**: `12345`

### Teacher Login
- **Email**: `teacher@demo.com` | **Password**: `school`

### Admin Login
- **ID**: `admin` | **PIN**: `admin`

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, TailwindCSS
- **Backend**: Supabase (PostgreSQL)
- **AI**: Google Gemini API
- **Charts**: Recharts
- **Build Tool**: Vite

---

## ♿ Accessibility

Built to WCAG 2.1 AA standards with keyboard navigation, screen reader support, and ARIA labels. See [ACCESSIBILITY.md](./ACCESSIBILITY.md) for details.

---

**Made with ❤️ for Indian International School Benin** | **Version**: 1.1.0
