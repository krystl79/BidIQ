// Application configuration
export const config = {
  appName: 'BidIQ',
  version: '1.0.0',
  apiBaseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001',
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET || 'bidiq-files',
  maxFileSize: 10 * 1024 * 1024, // 10MB
  supportedFileTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
  defaultPagination: {
    pageSize: 10,
    maxPages: 5
  }
};

// Feature flags
export const features = {
  enableAnalytics: false,
  enableNotifications: true,
  enableExport: true,
  enableImport: true
};

// Theme configuration
export const theme = {
  primaryColor: '#1976d2',
  secondaryColor: '#dc004e',
  backgroundColor: '#f5f5f5',
  textColor: '#333333',
  errorColor: '#f44336',
  successColor: '#4caf50',
  warningColor: '#ff9800'
}; 