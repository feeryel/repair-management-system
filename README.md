# 🛠️ Repair Management System

A modern **Repair Management System** designed to help repair workshops manage their daily operations, from customer requests and device management to repair tracking, planning, invoicing, spare parts, AI integration, and automated customer notifications.

The project combines a complete **Angular frontend**, **Node.js / Express backend**, **MySQL / MariaDB database**, **n8n automation workflows**, and an **AI layer powered by Ollama and MCP**.

---

## ✨ Features

### 👥 Customer Management

- Create and manage customers
- View customer information
- Update customer details
- Track customer repair history

### 💻 Device Management

- Register customer devices
- Manage device information
- Associate devices with customers
- Track devices throughout the repair process

### 📋 Repair Management

- Create repair requests
- Manage repair records
- Track repair status
- Assign technicians
- Manage repair details
- Follow the complete repair lifecycle

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

### 🔩 Spare Parts Management

- Manage spare parts
- Track stock quantities
- Manage part prices
- Associate spare parts with repairs
- Manage repair line items

### 🔐 Authentication & Authorization

- JWT authentication
- Protected routes
- User management
- Role-based access control

---

# ⚡ Workflow Automation with n8n

The system integrates **n8n** to automate business workflows and customer communication.

Instead of manually notifying customers when a repair is completed, the backend can trigger an **n8n webhook**, which processes the event and automatically sends a notification to the customer.

## 📧 Email & 💬 WhatsApp Notifications

The automation workflow can notify customers through:

- 📧 Email
- 💬 WhatsApp

### Example Workflow

```text
Repair Status Updated
        ↓
     Backend
        ↓
      Webhook
        ↓
       n8n
        ↓
 Check Repair Status
        ↓
   ┌────┴─────┐
   │          │
  DONE      Other
   │          │
   ▼          ▼
Email +      Stop
WhatsApp
Notification
   │
   ▼
  Client
```

When the repair reaches the **DONE / completed** status, the workflow automatically sends a notification to the customer informing them that their device is ready.

This approach helps:

- Reduce manual communication
- Improve customer experience
- Automate repetitive tasks
- Provide faster repair-status notifications
- Connect backend events with external communication services

---

# 🤖 AI Integration

The Repair Management System can be connected to an AI layer through a dedicated **Model Context Protocol (MCP) Server**.

The MCP server allows a local AI model powered by **Ollama** to interact with the repair management backend through structured tools.

Instead of allowing the AI to directly access the database, all operations go through controlled MCP tools and the existing REST API.

### AI Architecture

```text
User
 │
 ▼
Ollama / Local LLM
 │
 │ MCP
 ▼
MCP Server
 │
 │ REST / HTTP
 ▼
Repair Management API
 │
 ▼
MySQL / MariaDB
```

The AI can interact with business operations such as:

- Clients
- Devices
- Repairs
- Repair requests
- Invoices
- Spare parts
- Planning
- Users
- Repair lines

---

# 🏗️ Complete Architecture

The project combines traditional web development, AI integration, and workflow automation.

```text
                         ┌───────────────────┐
                         │       User        │
                         └─────────┬─────────┘
                                   │
                                   ▼
                         ┌───────────────────┐
                         │   Angular App     │
                         │     Frontend      │
                         └─────────┬─────────┘
                                   │
                                   │ REST API
                                   ▼
                         ┌───────────────────┐
                         │ Node.js / Express │
                         │      Backend      │
                         └───────┬─────┬─────┘
                                 │     │
                    ┌────────────┘     └─────────────┐
                    │                                │
                    ▼                                ▼
             ┌─────────────┐                  ┌─────────────┐
             │ MySQL /     │                  │     n8n     │
             │ MariaDB     │                  │  Workflows  │
             └─────────────┘                  └──────┬──────┘
                                                     │
                                             ┌───────┴────────┐
                                             │                │
                                             ▼                ▼
                                         📧 Email        💬 WhatsApp
                                             │                │
                                             └───────┬────────┘
                                                     │
                                                     ▼
                                                   Client


                         ┌───────────────────┐
                         │ Ollama / Local AI │
                         │       LLM         │
                         └─────────┬─────────┘
                                   │
                                   │ MCP
                                   ▼
                         ┌───────────────────┐
                         │    MCP Server     │
                         └─────────┬─────────┘
                                   │
                                   │ REST API
                                   ▼
                         ┌───────────────────┐
                         │     Backend       │
                         └───────────────────┘
```

---

# 🔄 Repair Notification Workflow

A typical automated repair notification follows this process:

```text
1. Technician updates the repair status
                 ↓
2. Backend stores the new status
                 ↓
3. Backend triggers an n8n webhook
                 ↓
4. n8n receives the repair information
                 ↓
5. Workflow checks the repair status
                 ↓
6. Status = DONE
                 ↓
7. Customer contact information is retrieved
                 ↓
8. Email notification is sent
                 ↓
9. WhatsApp notification is sent
                 ↓
10. Customer is informed that the device is ready
```

This creates an **event-driven automation workflow** between the repair management application and external communication services.

---

# 🧩 Main Modules

The application is organized around several business modules:

| Module | Description |
|---|---|
| 👥 Clients | Customer management |
| 💻 Devices | Customer device management |
| 🛠️ Repairs | Repair management |
| 📋 Repair Requests | Repair request tracking |
| 🧾 Invoices | Invoice generation and management |
| 🔩 Spare Parts | Inventory and repair parts |
| 📅 Planning | Workshop planning |
| 👤 Users | User and role management |
| 🤖 AI | AI-powered interaction through MCP |
| ⚡ Automation | n8n workflows |
| 📧 Notifications | Email notifications |
| 💬 WhatsApp | Customer WhatsApp notifications |

---

# 🛠️ Technologies

## Frontend

- **Angular**
- **TypeScript**
- **Bootstrap**
- HTML
- CSS

## Backend

- **Node.js**
- **Express.js**
- **Sequelize**
- REST API
- JWT Authentication

## Database

- **MySQL**
- **MariaDB**

## AI

- **Ollama**
- **Model Context Protocol (MCP)**
- Local Large Language Models
- Structured AI Tools

## Automation

- **n8n**
- Webhooks
- HTTP Requests
- Email Automation
- WhatsApp Notifications

## PDF & Documents

- **jsPDF**
- **jsPDF-AutoTable**
- **Puppeteer**
- **QRCode**

---

# 🔐 Security

The application uses JWT authentication to secure protected backend operations.

The AI architecture also follows a controlled-access approach:

```text
❌ AI → Database

✅ AI → MCP Tool → REST API → Database
```

This prevents the AI model from directly accessing the database.

The MCP server acts as an intermediate layer between the local LLM and the business application.

---

# 📂 Project Ecosystem

This project is part of a larger software ecosystem.

```text
                 Repair Management System
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
      Angular          Node.js          MCP Server
      Frontend         Backend          + Ollama
          │                │                │
          │                │                │
          └────────────────┼────────────────┘
                           │
                           ▼
                          n8n
                           │
                    ┌──────┴──────┐
                    ▼             ▼
                  Email        WhatsApp
```

---

# 🚀 Getting Started

## Prerequisites

Make sure you have installed:

- Node.js
- npm
- Angular CLI
- A running Repair Management backend
- MySQL / MariaDB
- n8n for workflow automation
- Ollama for local AI integration

---

## Clone the Repository

```bash
git clone https://github.com/feeryel/repair-management-system.git

cd repair-management-system
```

---

## Install Dependencies

```bash
npm install
```

---

## Run the Angular Application

```bash
ng serve
```

The application will be available at:

```text
http://localhost:4200
```

---

# ⚡ n8n Integration

The n8n workflow can be triggered using a webhook from the backend.

A typical workflow can contain:

```text
Webhook
   ↓
Receive Repair Data
   ↓
Check Repair Status
   ↓
Retrieve Customer Information
   ↓
Prepare Notification
   ↓
Send Email
   ↓
Send WhatsApp Message
```

The workflow can be extended with additional actions such as:

- SMS notifications
- Internal workshop notifications
- Logging
- Database updates
- Customer feedback requests
- Additional automation rules

---

# 🤖 MCP Integration

The dedicated MCP server exposes structured tools that allow an AI assistant to interact with the Repair Management backend.

Example:

```text
User:
"Show me the repairs currently in progress."

        ↓

Ollama
        ↓
Select MCP Tool
        ↓
getReparations
        ↓
MCP Server
        ↓
REST API
        ↓
Database
        ↓
Repair Data
        ↓
Ollama
        ↓
Natural Language Response
```

---

# 🎯 Project Objectives

The main objectives of the project are to:

- Digitize repair workshop management
- Centralize customer and device information
- Manage repair requests and repairs
- Automate customer communication
- Integrate email notifications
- Integrate WhatsApp notifications
- Use n8n for workflow automation
- Integrate AI through MCP
- Run local LLMs with Ollama
- Provide secure API communication
- Improve repair tracking
- Improve customer experience

---

# 💡 Technical Highlights

### 🌐 Full-Stack Architecture

The project combines an Angular frontend with a Node.js / Express backend and a MySQL / MariaDB database.

### ⚡ Event-Driven Automation

n8n connects backend events with automated communication workflows.

### 📧 Automated Email

Customers can receive automated emails based on repair status.

### 💬 WhatsApp Notifications

Customers can also receive WhatsApp notifications when important repair events occur.

### 🤖 Local AI

Ollama enables local LLM execution without requiring every AI operation to rely on a cloud model.

### 🔌 MCP Integration

MCP provides a standardized tool-based interface between the AI layer and the repair management application.

### 🔐 Controlled AI Access

The AI interacts with the backend through MCP tools and REST APIs instead of directly accessing the database.

---

# 🔗 Related Repositories

### Frontend — Angular

https://github.com/feeryel/repair-management-system

### Backend — Node.js / Express

https://github.com/feeryel/Backend_pfe

### MCP Server — Ollama + MCP

https://github.com/feeryel/mcp_server_pfe

---

# 👩‍💻 Author

## Feryel Dadi

**Software Engineer**  
**Master's Degree in Mobile Development Engineering**

🌐 **Portfolio:**  
https://portfolio-feryel.vercel.app

💼 **LinkedIn:**  
https://www.linkedin.com/in/feryeldadi

🐙 **GitHub:**  
https://github.com/feeryel

---

# 📄 License

This project was developed as part of an academic and professional software engineering project.
