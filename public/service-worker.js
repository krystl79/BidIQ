/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */

importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');

workbox.core.clientsClaim();
workbox.core.skipWaiting();

const fileExtensionRegexp = new RegExp('/[^/?]+\\.[^/]+$');
const pageRegexp = /^https:\/\/bidiq\.netlify\.app/;

// Handle navigation requests
registerRoute(
  ({ request, url }) => {
    if (request.mode !== 'navigate') {
      return false;
    }
    if (url.pathname.startsWith('/_')) {
      return false;
    }
    if (url.pathname.match(fileExtensionRegexp)) {
      return false;
    }
    return true;
  },
  createHandlerBoundToURL(process.env.PUBLIC_URL + '/index.html')
);

// Handle image requests
registerRoute(
  ({ request }) => request.destination === 'image',
  new StaleWhileRevalidate({
    cacheName: 'images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
);

// Handle push notifications
self.addEventListener('push', function(event) {
  const options = {
    body: event.data.text(),
    icon: '/logo192.png',
    badge: '/logo192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Details',
        icon: '/logo192.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/logo192.png'
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification('BidIQ Notification', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Handle background sync
self.addEventListener('sync', function(event) {
  if (event.tag === 'sync-bids') {
    event.waitUntil(syncBids());
  }
});

// IndexedDB setup
const DB_NAME = 'bidiq-offline';
const DB_VERSION = 1;
const STORE_NAME = 'bids';

function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

// Sync function
async function syncBids() {
  try {
    const db = await openIndexedDB();
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const bids = await new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    // Here you would typically send the bids to your server
    // For now, we'll just log them
    console.log('Syncing bids:', bids);

    // Clear the store after successful sync
    const clearTransaction = db.transaction(STORE_NAME, 'readwrite');
    const clearStore = clearTransaction.objectStore(STORE_NAME);
    await new Promise((resolve, reject) => {
      const request = clearStore.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error syncing bids:', error);
  }
} 