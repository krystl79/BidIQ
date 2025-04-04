# Build IQ - Equipment Rental Bid Estimation Platform

Build IQ is a modern web application that helps General Contractors, subcontractors, and small construction businesses quickly and accurately estimate rental equipment costs for their bids. The platform uses AI to generate equipment recommendations and provides a seamless workflow for creating professional bid documents.

## Features

- **Project Information Input**: Easy-to-use form for entering project details
- **AI-generated Equipment List**: Smart recommendations based on project type
- **Cost Estimation**: Accurate rental pricing from local/national vendors
- **Bid Template Generation**: Professional, customizable bid documents
- **Save & Manage**: Dashboard for managing multiple estimates
- **Share & Export**: Easy PDF export and email sharing
- **Lead Generation**: Optional sharing with rental companies for competitive quotes

## Tech Stack

- React with TypeScript
- Material-UI (MUI) for components
- React Router for navigation
- Web Vitals for performance monitoring
- Firebase for backend services
- Capacitor for mobile app support

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/build-iq.git
cd build-iq
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm start
# or
yarn start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

In the project directory, you can run:

### `npm start`
Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### `npm test`
Launches the test runner in the interactive watch mode.

### `npm run build`
Builds the app for production to the `build` folder.

### `npm run eject`
**Note: this is a one-way operation. Once you `eject`, you can't go back!**

## Project Structure

```
build-iq/
├── src/
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── ProjectInput.tsx
│   │   ├── EquipmentSelection.tsx
│   │   ├── BidReview.tsx
│   │   └── Dashboard.tsx
│   ├── components/
│   │   ├── ProjectForm.tsx
│   │   ├── EquipmentList.tsx
│   │   └── BidPreview.tsx
│   ├── services/
│   │   ├── api.ts
│   │   └── firebase.ts
│   ├── App.tsx
│   ├── index.tsx
│   └── reportWebVitals.ts
├── public/
├── package.json
├── tsconfig.json
└── README.md
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Material-UI for the component library
- React Router for navigation
- Web Vitals for performance monitoring
- Firebase for backend services
- Capacitor for mobile app support
