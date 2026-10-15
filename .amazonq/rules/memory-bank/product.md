# Kealex - Product Overview

## Project Purpose

Kealex is a comprehensive legal technology SaaS platform designed to streamline case management, document handling, and billing workflows for law firms and legal professionals in Brazil. The platform integrates AI-powered legal assistance with traditional case management tools.

## Value Proposition

- **Unified Legal Workspace**: Centralized management of cases, documents, deadlines, and billing
- **AI-Powered Legal Assistant**: GPT-4o mini specialized in Brazilian law with 8 domain-specific prompts
- **Automated Document Generation**: Convert AI responses to Word documents (.docx) with proper formatting
- **Intelligent Deadline Tracking**: Automated alerts for procedural deadlines (CPC, CLT)
- **Comprehensive Billing Management**: Track collection phases, payment status, and financial metrics
- **Role-Based Access Control**: Admin, lawyer, and client roles with appropriate permissions

## Key Features

### Case Management
- CRUD operations for legal cases (processos)
- Case timeline and phase tracking
- Document attachment and management
- Deadline monitoring with alerts
- Case status indicators and filtering

### Document Management
- Document upload and organization
- Integration with AI for document analysis
- Word document generation from AI responses
- Metadata tracking and versioning

### Financial Management
- Collection flow tracking (8 phases: Pending → Notification → 3 Collections → Judicial → Paid/Cancelled)
- Revenue dashboard with key metrics
- Payment status tracking
- Honorarium management

### AI Legal Assistant (Kealex AI Hub)
- Real-time chat with GPT-4o mini
- Specialized prompts for:
  - Case analysis and legislation
  - Procedural deadlines (CPC, CLT)
  - STF/STJ jurisprudence
  - Document drafting
- Markdown rendering with syntax highlighting
- Response streaming
- Export to Word documents

### User Management
- User creation and role assignment
- Permission management
- Activity auditing
- Trial period management

### Administrative Controls
- System configuration (CDN, Database, AI, Security)
- Tenant management
- Email and WhatsApp integration settings
- API key management

## Target Users

### Primary Users
- **Lawyers/Attorneys**: Case management, deadline tracking, AI assistance
- **Law Firm Administrators**: User management, billing oversight, system configuration
- **Legal Assistants**: Document management, deadline monitoring, case support

### Secondary Users
- **Clients**: Case status tracking, document access (limited view)
- **Finance Teams**: Revenue tracking, payment monitoring

## Use Cases

1. **Case Intake & Management**: Create cases, attach documents, track deadlines
2. **Legal Research**: Use AI assistant for legislation, jurisprudence, and case analysis
3. **Document Drafting**: Generate legal documents with AI assistance, export to Word
4. **Deadline Compliance**: Automated alerts for procedural deadlines
5. **Collection Management**: Track collection phases and payment status
6. **Financial Reporting**: Monitor revenue, outstanding payments, and metrics
7. **Team Collaboration**: Manage multiple users with role-based permissions

## Technical Deployment

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4
- **State Management**: React Query for server state
- **Routing**: React Router v7
- **API Communication**: Axios with JWT authentication
- **Hosting**: SPA deployment with Vite build

## Business Model

- **SaaS Subscription**: Monthly/annual billing
- **Trial Period**: Limited access for new users
- **Role-Based Pricing**: Different tiers for admin/lawyer/client access
- **API Access**: Premium tier for integrations

## Subscription Billing and Expiration

- Paid subscriptions use the Asaas integration and reuse the tenant's existing Asaas customer when available.
- Checkout supports credit card and PIX. Credit-card forms display the detected card brand while the user types.
- Pending payments remain pending in the product UI; paid access is granted only after payment confirmation.
- Confirmed monthly payments grant 30 days of access; quarterly payments grant 90 days. The backend maintains the expiration timestamp and exposes it as `subscriptionExpiresAt`.
- During the final 10 days before expiration, show a notice at login and a renewal banner in the TopBar. Each provides an action to reopen the payment modal.
- Asaas webhook events synchronize payment lifecycle changes; persistence and renewal processing are backend responsibilities.
