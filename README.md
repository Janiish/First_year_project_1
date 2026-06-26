# GuardRail: Project Overview & Architecture

## 1. Executive Summary
**GuardRail** is a lightweight, web-based Static Application Security Testing (SAST) application. Unlike traditional developer-centric security tools (like SonarQube or Checkmarx) that simply output technical error codes, GuardRail is built with a unique value proposition: the **Business Risk Scorecard**. 

It is designed to ingest raw JavaScript code, detect security vulnerabilities, and instantly translate those technical flaws into high-level business risks, operational impacts, and corporate financial consequences.

## 2. Core Purpose in the Real World
In real-world corporate environments, there is often a massive communication gap between the **Engineering Team** and the **C-Suite (Executives, Compliance Officers, Board Members)**. 
- A developer sees: *"CWE-89: Improper Neutralization of Special Elements used in an SQL Command."*
- An executive needs to know: *"Are we going to get fined under GDPR? Is customer data at risk? Does this block our upcoming SOC 2 audit?"*

**GuardRail bridges this gap.** By analyzing code and mapping it directly to regulatory frameworks (GDPR, HIPAA, PCI-DSS) and plain-English business impacts, GuardRail empowers non-technical stakeholders to make informed decisions about software risk and resource allocation.

## 3. Technology Stack & Tools Used
The project is built using a modern, decoupled JavaScript stack:

### Frontend (Client-Side)
- **React.js (via Vite)**: Provides a lightning-fast, component-based user interface.
- **Tailwind CSS v3**: Used for utility-first styling to create a premium, "dark-mode" enterprise aesthetic without writing thousands of lines of custom CSS.
- **CSS Keyframes**: Utilized for custom "magic" presentation effects, such as the sweeping cyber-laser scanning animation over the code editor.

### Backend (Server-Side)
- **Node.js & Express.js**: A lightweight HTTP server that provides a RESTful API (`/api/analyze`) to process code securely without relying on third-party SaaS APIs.
- **CORS**: Enabled to allow secure cross-origin requests from the React frontend to the Express backend.

### Analysis Engines
- **Regular Expressions (Regex)**: Factory-instantiated regex patterns are used for fast, pattern-matching secret detection (e.g., exposed AWS Keys, hardcoded passwords, JWTs).
- **Acorn & Acorn-Walk (AST Parsing)**: A powerful JavaScript parser that breaks code down into an Abstract Syntax Tree (AST). This allows GuardRail to understand the *structure* of the code (rather than just text matching), enabling the detection of complex logic flaws like SQL Injection via string concatenation, `eval()` usage, and XSS vulnerabilities.

## 4. Key Features
1. **Dual-Engine Analysis**: Combines pattern matching (Regex) for secrets with structural logic analysis (AST) for behavioral vulnerabilities.
2. **Business Impact Mapping**: A centralized translation layer that maps technical rule IDs to plain-English impacts and actionable developer recommendations.
3. **Regulatory Exposure Flags**: Automatically tags findings with the compliance frameworks they violate (e.g., exposing an AWS key tags the code with GDPR and SOC 2 warnings).
4. **Executive PDF Export**: A custom print-layout mode that strips away the IDE and developer tools, generating a clean, printable PDF scorecard for management reviews.
5. **One-Click Demo Payloads**: Built-in vulnerability scenarios (E-Commerce Checkout, Legacy Auth) for rapid tool demonstration without manual typing.

## 5. How to Run Locally
The project is divided into two separate applications that run concurrently.

**Start the Backend:**
```bash
cd "p:\My Projects\server"
npm install
npm run dev
```
*(Runs on http://localhost:5000)*

**Start the Frontend:**
```bash
cd "p:\My Projects\client"
npm install
npm run dev
```
*(Runs on http://localhost:5173)*

Navigate to `http://localhost:5173` in any modern web browser to access the dashboard.
