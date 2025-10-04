"# 💼 Expense Manager - Smart Expense Reimbursement System

![Expense Manager Banner](https://img.shields.io/badge/Expense%20Manager-v1.0.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)
![NestJS](https://img.shields.io/badge/NestJS-10-red.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)
![Prisma](https://img.shields.io/badge/Prisma-ORM-green.svg)

## 🚀 Overview

**Expense Manager** is a comprehensive expense reimbursement system designed to streamline and automate the entire expense approval workflow for organizations. Built with modern technologies, it provides a seamless experience for employees to submit expenses and managers to process approvals efficiently.

## 🎯 Problem Statement

Companies often struggle with manual expense reimbursement processes that are:
- ⏱️ **Time-consuming**: Manual processing delays reimbursements
- ❌ **Error-prone**: Human errors in calculations and data entry
- 🔍 **Lack transparency**: No clear visibility into approval status
- 📋 **Complex workflows**: Difficulty in managing multi-level approvals

### Key Challenges Addressed:
- ✅ Define approval flows based on thresholds
- ✅ Manage multi-level approvals
- ✅ Support flexible approval rules
- ✅ Automate expense data extraction from receipts
- ✅ Currency conversion support
- ✅ Real-time status tracking

## 🌟 Core Features

### 🔐 Authentication & User Management

#### First-Time Setup
- **Auto-Company Creation**: On signup, a new company is automatically created
- **Currency Configuration**: Company currency is set based on selected country
- **Admin User**: First user becomes the admin with full permissions

#### Admin Capabilities
- 👥 **User Management**: Create employees and managers
- 🔄 **Role Assignment**: Assign and change roles (Employee, Manager, Admin)
- 🏗️ **Organizational Structure**: Define manager-employee relationships
- ⚙️ **System Configuration**: Configure approval workflows and rules

### 💰 Expense Submission (Employee Role)

#### Employee Features
- 📝 **Expense Claims**: Submit detailed expense claims with:
  - Amount (supports multiple currencies)
  - Category selection
  - Description and business purpose
  - Date of expense
  - Receipt attachment
- 📊 **Expense History**: View complete expense history
- 📈 **Status Tracking**: Monitor approval status in real-time
- 🔍 **OCR Integration**: Scan receipts for automatic data extraction

### ✅ Approval Workflow (Manager/Admin Role)

#### Flexible Approval System
- **Manager First**: Optional manager approval as first step
- **Sequential Approval**: Define custom approval sequences
- **Multi-Level Support**: Support for complex organizational hierarchies

#### Example Workflow:
```
Step 1 → Direct Manager
Step 2 → Finance Team
Step 3 → Department Director
Step 4 → CFO (for high amounts)
```

#### Manager Capabilities
- 📋 **Approval Queue**: View expenses waiting for approval
- ✅ **Approve/Reject**: Process expenses with comments
- 💬 **Communication**: Add notes and feedback
- 🔄 **Escalation**: Forward to next approver in sequence

### 🎛️ Conditional Approval Flow

#### Advanced Rule Engine
- **Percentage Rules**: 
  - Example: "If 60% of approvers approve → Expense approved"
- **Specific Approver Rules**: 
  - Example: "If CFO approves → Expense auto-approved"
- **Hybrid Rules**: 
  - Example: "60% approval OR CFO approval"
- **Combined Workflows**: Mix sequential and conditional flows

## 👥 User Roles & Permissions

| Role | Permissions |
|------|-------------|
| **Admin** | • Create company (auto on signup)<br>• Manage all users and roles<br>• Configure approval rules<br>• View all expenses<br>• Override any approval<br>• System configuration |
| **Manager** | • Approve/reject assigned expenses<br>• View team expenses<br>• See amounts in company currency<br>• Escalate per defined rules<br>• Manage direct reports |
| **Employee** | • Submit expense claims<br>• View personal expense history<br>• Check approval status<br>• Upload receipts<br>• Use OCR for data extraction |

## 🔧 Technology Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/UI
- **State Management**: React Context
- **Icons**: Lucide React

### Backend
- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT
- **Email**: Nodemailer
- **File Upload**: Multer

### Additional Features
- **OCR**: Tesseract.js for receipt scanning
- **Currency API**: REST Countries API
- **Exchange Rates**: ExchangeRate-API
- **Notifications**: React Hot Toast

## 🚀 Additional Features

### 📱 OCR for Receipts (Auto-Read)
Advanced receipt scanning technology that:
- 📸 **Smart Scanning**: Automatically extracts data from receipt images
- 🤖 **AI-Powered**: Uses OCR algorithms for accurate data recognition
- 📊 **Auto-Population**: Fills expense forms automatically with:
  - Expense amount
  - Transaction date
  - Merchant/restaurant name
  - Expense category
  - Line items and descriptions
- ✨ **Multiple Formats**: Supports images (JPG, PNG) and PDF receipts

### 🌍 Multi-Currency Support
- **Global Operations**: Support for international expenses
- **Real-Time Conversion**: Automatic currency conversion using live rates
- **Base Currency**: Company-wide default currency setting
- **Exchange History**: Track historical exchange rates for audit trails

## 🔗 External APIs

| API | Purpose | URL |
|-----|---------|-----|
| **Countries & Currencies** | Get country list with currencies | `https://restcountries.com/v3.1/all?fields=name,currencies` |
| **Exchange Rates** | Real-time currency conversion | `https://api.exchangerate-api.com/v4/latest/{BASE_CURRENCY}` |

## 📁 Project Structure

```
expense-manager/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # App router pages
│   │   ├── components/      # Reusable UI components
│   │   ├── lib/            # Utilities and configurations
│   │   └── services/       # API services and OCR
├── backend/                 # NestJS backend application
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── users/          # User management
│   │   ├── expenses/       # Expense handling
│   │   ├── approvals/      # Approval workflow
│   │   └── mail/           # Email services
│   └── prisma/             # Database schema and migrations
└── README.md               # Project documentation
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database
- Git

### Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/krishdave-dev/Expense-Manager-Odoo-X-AMALTHEA.git
cd Expense-Manager-Odoo-X-AMALTHEA
```

2. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Configure your database URL in .env
npx prisma migrate dev
npm run start:dev
```

3. **Frontend Setup**
```bash
cd ../frontend
npm install
npm run dev
```

4. **Access the Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## 💡 Key Workflows

### 1. Company Setup Flow
```
User Signup → Company Creation → Currency Setup → Admin Dashboard
```

### 2. Employee Expense Flow
```
Scan Receipt → OCR Processing → Form Pre-fill → Submit → Track Status
```

### 3. Approval Flow
```
Expense Submitted → Manager Review → Conditional Rules → Final Approval
```

## 🔒 Security Features

- 🔐 **JWT Authentication**: Secure token-based authentication
- 🛡️ **Role-Based Access**: Granular permission system
- 🔒 **Data Encryption**: Sensitive data protection
- 🌐 **CORS Protection**: Cross-origin request security
- 📝 **Audit Logs**: Complete activity tracking

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Authors

- **Krishna Dave** - *Initial work* - [@krishdave-dev](https://github.com/krishdave-dev)

## 🙏 Acknowledgments

- Built for Odoo x Amalthea hackathon
- Inspired by modern expense management needs
- Thanks to the open-source community for amazing tools

## 📞 Support

For support, please reach out:
- 📧 Email: krishdave.dev@gmail.com
- 🐛 Issues: [GitHub Issues](https://github.com/krishdave-dev/Expense-Manager-Odoo-X-AMALTHEA/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/krishdave-dev/Expense-Manager-Odoo-X-AMALTHEA/discussions)

---

<div align="center">
  <strong>🚀 Transform your expense management process today!</strong>
  
  [![Deploy to Production](https://img.shields.io/badge/Deploy-Production-success.svg)](https://your-deployment-url.com)
  [![Live Demo](https://img.shields.io/badge/Live-Demo-blue.svg)](https://your-demo-url.com)
</div>"
