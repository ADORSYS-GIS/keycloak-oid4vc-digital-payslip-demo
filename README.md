# EUDI Digital Payslip Demo Environment

This project is a React application that provides a specialized demonstration environment for issuing Digital Payslips (Gehaltsnachweise) as Verifiable Credentials using OID4VC (OpenID for Verifiable Credentials) via the EUDI-Wallet.

It provides a complete flow simulating a mock employer portal (like DATEV) where an employee can authenticate via Keycloak SSO and seamlessly issue a structured Digital Payslip to their wallet.

## Features

- **Payslip Dashboard UI:** A pixel-perfect, responsive demonstration dashboard matching the premium design requirements for Gehaltsnachweise.
- **User Authentication:** Login and logout functionality securely integrated with Keycloak SSO.
- **OID4VC Credential Issuance:** Seamless generation of OID4VC Credential Offer Deep Links formatted specifically for EUDI-Wallet payslip ingestion.
- **QR Code Integration:** Dynamic QR code generation for smooth wallet pairing and issuance flows.
- **Modern Tech Stack:** Built with React, Vite, and Lucide Icons.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) package manager
- A running Keycloak instance with the `oid4vc-payslip` realm and `PayslipCredential` scope configured.

### Installation

1.  Clone the repository:

    ```bash
    git clone https://github.com/ADORSYS-GIS/keycloak-oid4vc-digital-payslip-demo.git
    cd keycloak-oid4vc-digital-payslip-demo
    ```

2.  Install the dependencies:
    ```bash
    npm install
    ```

### Configuration

1. Using `.env.example` as a template, create a `.env` file in the root of the project and update the variables with your specific Keycloak coordinates:
   ```bash
   cp .env.example .env
   ```

### Running the Application

To start the development server, run the following command:

```bash
npm run dev
```

The application will be available at the port configured by Vite (usually `http://localhost:4200` or `http://localhost:5173`).

## Available Scripts

In the project directory, you can run:

- `npm run dev`: Runs the app in development mode.
- `npm run build`: Builds the app for production to the `dist` folder.
- `npm run lint`: Lints the codebase using ESLint.
- `npm run preview`: Serves the production build locally for preview.
