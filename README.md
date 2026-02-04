# AWS Serverless Room Inspection Upload System

A secure, cloud‑native web application designed to streamline university room inspection workflows.  
The system combines a modern React frontend with a fully serverless AWS backend, enabling Resident Assistants (RAs) and Administrators to upload, review, and manage room inspection photos with reliability, scalability, and strong access control.

---

## Overview

The Room Inspection Upload System provides a complete workflow for capturing, storing, and reviewing room inspection images.  
RAs submit photos and metadata, while administrators review, approve, or reject submissions through a dedicated dashboard.

The platform emphasizes:

- Role‑based access control  
- Secure, encrypted storage  
- Operational auditability  
- Scalable, serverless architecture  
- Fast, intuitive user experience  

---

## Key Features

### Core Functionality
- Secure multi‑file image uploads to Amazon S3  
- Real‑time upload progress indicators and client‑side validation  
- Organized, audit‑friendly storage structure  
- End‑to‑end serverless workflow using AWS services  

### RA Dashboard
- Multi‑file upload support with live image previews  
- Metadata entry (dorm, room number, notes, uploader info)  
- Real‑time validation for file size, type, and completeness  
- Clean, responsive UI built with React + Tailwind  

### Admin Dashboard
- Review all submitted inspection reports  
- Approve or reject submissions with status tracking  
- Dorm‑level filtering, search, sorting, and pagination  
- User management tools for onboarding RAs and admins  
- Signed S3 preview URLs for secure image viewing  

### User Management
- Custom AWS Lambda + API Gateway endpoint for creating users  
- Admin‑only role assignment (RA, Admin)  
- Integration with Cognito User Pools and Identity Pools  
- Temporary AWS credentials for secure, scoped access  

---

## Security & Reliability

- IAM least‑privilege role design  
- CORS configuration for controlled access  
- Encrypted S3 storage and secure presigned URLs  
- DynamoDB for durable, scalable metadata storage  

---

## Code Quality

- Modular React components  
- Custom hooks for AWS operations and authentication  
- Clear separation of concerns across frontend and backend  
- Maintainable, production‑ready codebase  

---

## Architecture

### Frontend
- **React (Vite)** – Fast, modern UI framework  
- **Tailwind CSS** – Utility‑first styling  

### Backend / Cloud
- **AWS Lambda** – Serverless compute for backend logic and user creation  
- **Amazon API Gateway** – Secure REST API endpoints  
- **Amazon Cognito** – Authentication and user management  
- **Amazon S3** – Secure, scalable photo storage  
- **Amazon DynamoDB** – NoSQL metadata and report storage  
- **AWS IAM** – Fine‑grained access control  
- **AWS SDK for JavaScript** – Uploads, queries, and secure operations  

---

## Setup

### Prerequisites
- Node.js (v16+)  
- npm or yarn  
- AWS account with Cognito, S3, DynamoDB, IAM, and API Gateway configured  

### Installation

```bash
git clone <repository-url>
cd roomcheck-upload

npm install
Configure environment variables (e.g. .env):

COGNITO_USER_POOL_ID

COGNITO_APP_CLIENT_ID

IDENTITY_POOL_ID

S3_BUCKET_NAME

DYNAMODB_TABLE_REPORTS

API_GATEWAY_BASE_URL

Start the development server:

bash
npm run dev
```
---

### Project Timeline
Nov 2025 – Feb 2026
