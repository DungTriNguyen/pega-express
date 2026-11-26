# ADR-001: Next.js (App Router) cho website và CRM

- Trạng thái: Đã chấp nhận (27/11/2026, plan v1.4)
- Bối cảnh: Website giới thiệu cần nhanh (SSG); sau này cần CRM nội bộ có đăng nhập **trên cùng domain**, team FE + BE riêng.
- Quyết định: Next.js 16 App Router + React Server Components + TypeScript strict. Trang công khai build tĩnh; CRM sẽ nằm trong nhóm route `(crm)`.
- Hệ quả: Một codebase, một design system, một hệ thống auth/proxy. Phải giữ kỷ luật hiệu năng: mặc định Server Component, `"use client"` ở lá, ngân sách JS kiểm tra trong CI. Thay thế Astro (v1.3).
