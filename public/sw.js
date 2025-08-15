const CACHE_NAME = "agentpay-v1.0.0"
const STATIC_CACHE = "agentpay-static-v1.0.0"
const DYNAMIC_CACHE = "agentpay-dynamic-v1.0.0"

// Assets to cache on install
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
]

// API routes to cache dynamically
const API_ROUTES = ["/api/dashboard/stats", "/api/invoices", "/api/services"]

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker...")

  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log("[SW] Caching static assets")
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log("[SW] Static assets cached successfully")
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error("[SW] Failed to cache static assets:", error)
      }),
  )
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker...")

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log("[SW] Deleting old cache:", cacheName)
              return caches.delete(cacheName)
            }
          }),
        )
      })
      .then(() => {
        console.log("[SW] Service worker activated")
        return self.clients.claim()
      }),
  )
})

// Fetch event - serve from cache with network fallback
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== "GET") {
    return
  }

  // Skip external requests
  if (url.origin !== self.location.origin) {
    return
  }

  // Handle API requests with network-first strategy
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful API responses
          if (response.status === 200 && API_ROUTES.some((route) => url.pathname.startsWith(route))) {
            const responseClone = response.clone()
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseClone)
            })
          }
          return response
        })
        .catch(() => {
          // Fallback to cache for API requests
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse
            }
            // Return offline response for critical API endpoints
            return new Response(
              JSON.stringify({
                error: "Offline",
                message: "This feature requires an internet connection",
              }),
              {
                status: 503,
                statusText: "Service Unavailable",
                headers: { "Content-Type": "application/json" },
              },
            )
          })
        }),
    )
    return
  }

  // Handle static assets with cache-first strategy
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse
      }

      // Network fallback for uncached resources
      return fetch(request)
        .then((response) => {
          // Cache successful responses
          if (response.status === 200) {
            const responseClone = response.clone()
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseClone)
            })
          }
          return response
        })
        .catch(() => {
          // Offline fallback page
          if (request.destination === "document") {
            return caches.match("/")
          }

          // Offline fallback for images
          if (request.destination === "image") {
            return new Response(
              '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#f3f4f6"/><text x="100" y="100" text-anchor="middle" dy=".3em" fill="#6b7280">Offline</text></svg>',
              { headers: { "Content-Type": "image/svg+xml" } },
            )
          }
        })
    }),
  )
})

// Background sync for pending orders
self.addEventListener("sync", (event) => {
  console.log("[SW] Background sync triggered:", event.tag)

  if (event.tag === "sync-pending-orders") {
    event.waitUntil(syncPendingOrders())
  }
})

// Push notification handler
self.addEventListener("push", (event) => {
  console.log("[SW] Push notification received")

  const options = {
    body: "Your order has been updated",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/badge-72x72.png",
    vibrate: [200, 100, 200],
    data: {
      url: "/dashboard",
    },
    actions: [
      {
        action: "view",
        title: "View Order",
        icon: "/icons/action-view.png",
      },
      {
        action: "dismiss",
        title: "Dismiss",
        icon: "/icons/action-dismiss.png",
      },
    ],
  }

  if (event.data) {
    const data = event.data.json()
    options.body = data.message || options.body
    options.data.orderId = data.orderId
  }

  event.waitUntil(self.registration.showNotification("AgentPay", options))
})

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked:", event.action)

  event.notification.close()

  if (event.action === "view") {
    const url = event.notification.data.orderId ? `/dashboard/orders/${event.notification.data.orderId}` : "/dashboard"

    event.waitUntil(clients.openWindow(url))
  }
})

// Helper function to sync pending orders
async function syncPendingOrders() {
  try {
    console.log("[SW] Syncing pending orders...")

    // Get pending orders from IndexedDB or localStorage
    const pendingOrders = await getPendingOrders()

    for (const order of pendingOrders) {
      try {
        const response = await fetch("/api/orders/sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(order),
        })

        if (response.ok) {
          await removePendingOrder(order.id)
          console.log("[SW] Order synced successfully:", order.id)
        }
      } catch (error) {
        console.error("[SW] Failed to sync order:", order.id, error)
      }
    }
  } catch (error) {
    console.error("[SW] Background sync failed:", error)
  }
}

// Helper functions for offline storage
async function getPendingOrders() {
  // Implementation would use IndexedDB
  return []
}

async function removePendingOrder(orderId) {
  // Implementation would remove from IndexedDB
  console.log("[SW] Removing pending order:", orderId)
}
