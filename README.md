# BidIQ

BidIQ is a web application for managing and analyzing bid documents. It helps users process, analyze, and manage RFPs (Request for Proposals) and other bid-related documents.

## Features

- Document processing and analysis
- Bid management and tracking
- Project organization
- User authentication
- Local data storage using IndexedDB
- Document text extraction and analysis
- Web scraping for online RFPs

## Tech Stack

- Frontend: React.js with Material-UI
- Backend: Express.js
- Database: IndexedDB (client-side)
- Document Processing: PDF-lib, AWS Textract
- AI Integration: Google's Gemini Pro
- Storage: Google Cloud Storage

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/bidiq.git
cd bidiq
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
# Server Configuration
PORT=5001
NODE_ENV=development

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key

# API Keys
DOCUPANDA_API_KEY=your_docupanda_api_key

# Storage Configuration
STORAGE_BUCKET=bidiq-files

# CORS Configuration
ALLOWED_ORIGINS=https://67ee000573287e0008357415--bidiq.netlify.app,http://localhost:3000
```

4. Start the development server:
```bash
npm run dev
```

This will start both the frontend (port 3000) and backend (port 5001) servers.

## Project Structure

```
bidiq/
├── src/
│   ├── components/     # React components
│   ├── contexts/       # React contexts
│   ├── services/       # Service modules
│   ├── utils/          # Utility functions
│   └── App.js          # Main application component
├── server.js           # Express server
├── package.json        # Project dependencies
└── .env               # Environment variables
```

## API Endpoints

- `POST /api/process-solicitation`: Process PDF documents
- `POST /api/process-solicitation-link`: Process web pages
- `POST /api/process-document`: Process general documents

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
