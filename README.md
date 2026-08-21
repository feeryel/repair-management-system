# 🔧 Repair Management System — Frontend

A modern web application built with **Angular 17** for managing customer service and repair workshop operations.

The platform provides a centralized interface for managing **customers, devices, repair requests, repair workflows, planning, labels, invoices, and workshop activities**.

This repository contains the **Angular frontend** of the Repair Management System. The backend is maintained in a separate repository.

---

## 📌 About the Project

The **Repair Management System** is a complete solution designed to digitalize and streamline repair workshop operations.

The system covers the complete repair lifecycle, from registering a customer and their device to creating a repair request, tracking the repair process, generating labels and invoices, and completing the repair.

The application was developed with a focus on **modularity, maintainability, authentication, and efficient communication between the frontend and backend**.

---

## ✨ Main Features

### 👥 Customer Management

* Create and manage customers
* View customer information
* Access customer repair history
* Associate customers with their devices and repair requests

### 💻 Device Management

* Register customer devices
* Store device and technical information
* Associate devices with customers
* Track devices throughout the repair lifecycle

### 🛠️ Repair Management

* Create repair requests
* Manage repair information
* Track repair status
* Follow the complete repair workflow
* Manage repair-related data

### 📅 Planning & Scheduling

* Organize repair activities
* Manage workshop planning
* Schedule repair operations
* Track planned activities

### 🏷️ Labels & QR Codes

* Generate repair labels
* Generate QR codes
* Facilitate device identification and tracking

### 🧾 Invoice Management

* Generate invoices
* Display invoice information
* Export invoices as PDF
* Manage invoice-related data

### 🔐 Authentication & Authorization

* User authentication
* JWT-based authentication
* Protected routes
* Role-based access control
* Secure communication with backend APIs

### 🤖 AI & Automation

The Repair Management System also integrates AI-oriented features designed to improve workshop operations, including:

* OCR-based invoice/document processing
* AI-assisted data extraction
* MCP-based AI integration
* Automated workflows using n8n

---

## 🏗️ Architecture

The project follows a **client-server architecture** with separate frontend and backend repositories.

```text
                    REPAIR MANAGEMENT SYSTEM
                              │
             ┌────────────────┴────────────────┐
             │                                 │
             ▼                                 ▼
      Angular Frontend                  Node.js Backend
       Repository                         Repository
             │                                 │
             │           REST API              │
             └────────────────►◄──────────────┘
                                               │
                                               ▼
                                      MySQL / MariaDB
```

### Frontend

The frontend is responsible for:

* User interface
* Navigation
* Forms and validation
* Authentication
* Role-based access
* API communication
* Data visualization
* PDF and QR code generation

### Backend

The backend provides:

* REST APIs
* Business logic
* Authentication
* Authorization
* Database management
* Repair management services
* Invoice services
* AI integrations

---

## 🛠️ Tech Stack

### Frontend

* **Angular 17**
* **TypeScript**
* **HTML5**
* **CSS3**
* **Bootstrap 5**
* **RxJS**
* **jsPDF**
* **jsPDF-AutoTable**
* **QRCode**

### Backend

* **Node.js**
* **Express.js**
* **Sequelize**
* **JWT**
* **MySQL / MariaDB**
* **Puppeteer**
* **PDFKit**

### AI & Automation

* **OCR**
* **Ollama**
* **Model Context Protocol (MCP)**
* **n8n**

### Tools

* **Git**
* **GitHub**
* **Postman**
* **Docker**

---

## 📂 Project Structure

```text
repair-management-system/
│
├── src/
│   ├── app/
│   │   ├── components/
│   │   ├── services/
│   │   ├── guards/
│   │   ├── models/
│   │   └── ...
│   │
│   ├── assets/
│   └── environments/
│
├── angular.json
├── package.json
├── package-lock.json
├── server.ts
├── tsconfig.json
├── netlify.toml
└── README.md
```

---

## ⚙️ Getting Started

### Prerequisites

Make sure you have installed:

* Node.js
* npm
* Angular CLI
* Git

### Clone the repository

```bash
git clone https://github.com/feeryel/repair-management-system.git

cd repair-management-system
```

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
ng serve
```

The application will be available at:

```text
http://localhost:4200/
```

---

## 🔗 Backend Repository

The backend is maintained separately using **Node.js, Express, Sequelize, and MySQL/MariaDB**.

👉 **Backend Repository:**
`https://github.com/feeryel/Backend_pfe`

Make sure the backend server is running and the frontend API configuration points to the correct backend URL.

---

## 🔄 Repair Workflow

```text
Customer
   │
   ▼
Device Registration
   │
   ▼
Repair Request
   │
   ▼
Diagnosis
   │
   ▼
Repair
   │
   ▼
Planning & Tracking
   │
   ▼
Repair Completed
   │
   ▼
Invoice Generation
   │
   ▼
Customer Delivery
```

---

## 🤖 AI-Powered OCR

One of the main objectives of the project is to integrate **Artificial Intelligence into the repair workflow**.

The system includes an OCR-oriented approach for extracting relevant information from invoices and documents, reducing manual data entry and improving processing efficiency.

The project also explores the use of **Ollama, MCP, and n8n** to integrate AI capabilities and automate business workflows.

---

## 🎯 Project Goals

The main objectives of the Repair Management System are to:

* Digitalize repair workshop operations
* Centralize customer and device information
* Improve repair tracking and traceability
* Simplify workshop planning
* Automate invoice generation
* Generate repair labels and QR codes
* Reduce manual administrative tasks
* Introduce AI-assisted document processing
* Provide a scalable architecture for future integrations

---

## 👩‍💻 Author

### Feryel Dadi

**Software Engineer — Software Engineering**
**Master's Degree in Mobile Development Engineering**

* 🌐 Portfolio: https://portfolio-feryel.vercel.app
* 🐙 GitHub: https://github.com/feeryel
* 💼 Linkedin: https://www.linkedin.com/in/feryeldadi/
---

## 📄 License

This project was developed as part of an academic and professional software engineering project.
