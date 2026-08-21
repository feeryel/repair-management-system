# 🛠️ Repair Management System — Frontend

A modern **Angular frontend** for managing the operations of a repair workshop, including customers, devices, repair requests, repairs, planning, invoices, spare parts, and user management.

This frontend is part of a complete repair management ecosystem connected to a **Node.js / Express backend**, **MySQL / MariaDB database**, **n8n automation workflows**, and an AI layer through **MCP and Ollama**.

---

## ✨ Features

### 👥 Customer Management

- Create and manage customers
- Update customer information
- View customer details
- Track customer repair history

### 💻 Device Management

- Register customer devices
- Manage device information
- Associate devices with customers
- Track device repair history

### 📋 Repair Management

- Create repair requests
- Manage repairs
- Track repair status
- Assign technicians
- Follow the repair lifecycle

### 📅 Planning

- Schedule repair operations
- Manage start and end dates
- Assign responsible users
- Organize workshop activities

### 🧾 Invoice Management

- Create and manage invoices
- Calculate invoice amounts
- Manage VAT and fiscal stamp
- Associate invoices with repairs
- Generate PDF invoices

### 🔩 Spare Parts

- Manage spare parts
- Track stock quantities
- Associate parts with repairs
- Manage repair line items

### 🔐 Authentication

- JWT-based authentication
- Protected routes
- User management
- Role-based access control

---

## 🤖 AI Integration

The frontend is part of an ecosystem that includes an **MCP Server** connected to a local AI layer powered by **Ollama**.

The AI can interact with the repair management system through structured MCP tools exposed by the backend.

```text
User
 │
 ▼
Angular Frontend
 │
 ▼
Backend REST API
 │
 ├──────────────► MySQL / MariaDB
 │
 ▼
MCP Server
 │
 ▼
Ollama / Local LLM
```

---

## ⚡ Automated Customer Notifications

The complete application integrates **n8n** to automate customer communication when important repair events occur.

For example, when a repair is completed:

```text
Repair Completed
      ↓
Backend
      ↓
n8n Webhook
      ↓
Automation Workflow
      ↓
┌───────────────┬────────────────┐
│               │                │
▼               ▼                │
📧 Email      💬 WhatsApp        │
│               │                │
└───────────────┴────────────────┘
                ↓
        👤 Customer Notified
                ↓
       📱 Device Ready
```

The backend repository also contains the **n8n workflow and demonstration assets** for this process.

---

## 🏗️ Application Architecture

```text
                    ┌─────────────────────┐
                    │       User          │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Angular Frontend  │
                    │                     │
                    │ • UI                │
                    │ • Forms             │
                    │ • Routing           │
                    │ • Authentication    │
                    └──────────┬──────────┘
                               │
                               │ REST / HTTP
                               ▼
                    ┌─────────────────────┐
                    │   Node.js Backend   │
                    │    / Express API    │
                    └───────┬─────┬───────┘
                            │     │
                            │     └─────────────► n8n
                            │                         │
                            ▼                         ├──► Email
                     MySQL / MariaDB                  └──► WhatsApp
```

---

## 🛠️ Technologies

### Frontend

- **Angular**
- **TypeScript**
- **Bootstrap**
- HTML
- CSS

### Backend Integration

- REST API
- HTTP / JSON
- JWT Authentication

### Documents

- jsPDF
- jsPDF-AutoTable
- Puppeteer
- QRCode

### AI & Automation Ecosystem

- Ollama
- Model Context Protocol (MCP)
- n8n
- Webhooks
- Email automation
- WhatsApp notifications

---

## 📂 Project Structure

```text
repair-management-system/
│
├── src/
│   ├── app/
│   ├── assets/
│   └── environments/
│
├── angular.json
├── package.json
├── package-lock.json
├── server.ts
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have:

- Node.js
- npm
- Angular CLI
- A running Repair Management backend

### Clone the repository

```bash
git clone https://github.com/feeryel/repair-management-system.git

cd repair-management-system
```

### Install dependencies

```bash
npm install
```

### Run the application

```bash
ng serve
```

The application will be available at:

```text
http://localhost:4200
```

---

## 🔗 Related Repositories

### Backend — Node.js / Express

https://github.com/feeryel/Backend_pfe

### MCP Server — Ollama + MCP

https://github.com/feeryel/mcp_server_pfe

---

## 🎯 Project Objectives

- Digitize repair workshop management
- Centralize customer and device information
- Track repairs from request to completion
- Manage planning, invoices, and spare parts
- Improve customer communication
- Automate notifications with n8n
- Integrate AI capabilities through MCP
- Explore local LLM integration with Ollama

---

## 👩‍💻 Author

**Feryel Dadi — Software Engineer**

🌐 Portfolio:  
https://portfolio-feryel.vercel.app

💼 LinkedIn:  
https://www.linkedin.com/in/feryeldadi

🐙 GitHub:  
https://github.com/feeryel
