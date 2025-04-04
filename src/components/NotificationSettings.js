import React, { useState, useEffect } from 'react';
import { requestNotificationPermission, sendTestNotification } from '../utils/notifications';

const NotificationSettings = () => {
  const [permission, setPermission] = useState(Notification.permission);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Check if service worker is registered
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        console.log('Service Worker is ready:', registration);
      });
    }
  }, []);

  const handleEnableNotifications = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const granted = await requestNotificationPermission();
      if (granted) {
        setPermission('granted');
        setSuccess('Notifications enabled successfully!');
      } else {
        setError('Please enable notifications in your browser settings.');
      }
    } catch (err) {
      setError('Failed to enable notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTestNotification = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const sent = await sendTestNotification();
      if (sent) {
        setSuccess('Test notification sent!');
      } else {
        setError('Failed to send test notification.');
      }
    } catch (err) {
      setError('Failed to send test notification. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Notification Settings</h2>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-600">{success}</p>
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-2">
            Current status: <span className="font-medium">{permission}</span>
          </p>
          
          {permission !== 'granted' && (
            <button
              onClick={handleEnableNotifications}
              disabled={loading}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Enabling...' : 'Enable Notifications'}
            </button>
          )}
        </div>
        
        {permission === 'granted' && (
          <div>
            <button
              onClick={handleTestNotification}
              disabled={loading}
              className={`inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Sending...' : 'Send Test Notification'}
            </button>
          </div>
        )}
        
        <div className="text-sm text-gray-500">
          <p>You'll receive notifications for:</p>
          <ul className="list-disc list-inside mt-2">
            <li>New bid submissions</li>
            <li>Bid status updates</li>
            <li>Important deadlines</li>
            <li>System updates</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings; 