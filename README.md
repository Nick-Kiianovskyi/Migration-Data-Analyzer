# Migration-Data-Analyzer
Migration data analyzer

# 📊 Migratio

> Data migration analyzer developed with React, TypeScript, Node.js, Express and Vite.  
> Web application for comparing datasets before and after migration.

![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?logo=tailwindcss&logoColor=white)
![DuckDB](https://img.shields.io/badge/DuckDB-WASM-yellow)
![Vercel](https://img.shields.io/badge/Vercel-000000?logo=vercel&logoColor=white)

[![Live Demo](https://img.shields.io/badge/Live-Demo-success?style=for-the-badge)](https://migrato-five.vercel.app)

---

## 🌐 Live Demo

👉 https://migrato-five.vercel.app

---

## 📖 About

**Migratio** is a lightweight web application designed to validate data migration.  
It allows users to upload two datasets (*Pre-Migration* and *Post-Migration*) and automatically compare them to detect inconsistencies.

The tool simplifies migration testing by providing clear reports and visualizations without the need for databases or manual checks.

---

## ✨ Features

- ✅ Upload Excel/CSV files (*before* and *after* migration)  
- ✅ Two analysis modes:
  - **Key Field Analysis** — compare records by unique identifier  
  - **Full Comparison** — cell-by-cell comparison of all data  
- ✅ Instant conversion of Excel into lightweight JSON for fast processing  
- ✅ Visualization of differences in a clean UI  
- ✅ Export results to Excel/PDF  
- ✅ Responsive interface for desktop and mobile  
- ✅ Works entirely in-browser (DuckDB WASM, no external DB required)  
- ✅ Strong type safety with **TypeScript** (≈75% codebase)  

---

## 📷 Screenshots

### Upload & Compare
![Upload](screenshots/upload.png)
![Upload](screenshots/upload1.png)

### Comparison Result
![Comparison](screenshots/result1.png)
![Comparison](screenshots/result2.png)

### Mobile Version
![Mobile](screenshots/mobile.png)

---

## 🏗 Architecture

```text
┌─────────────────────┐
│ React + Vite + TS   │
│ Frontend            │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Node.js + Express   │
│ Backend API         │
└──────────┬──────────┘
           │
           ▼
   DuckDB WASM (in-browser)
