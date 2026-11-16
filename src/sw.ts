/// <reference lib="webworker" />
import { cleanupOutdatedCaches, matchPrecache, precacheAndRoute } from "workbox-precaching";
import { NavigationRoute, registerRoute } from "workbox-routing";
import { NetworkFirst } from "workbox-strategies";

declare let self: ServiceWorkerGlobalScope;

// Force l'activation immédiate du nouveau Service Worker (remplace l'ancien cache Workbox)
self.addEventListener("install", () => {
  void self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

// NetworkFirst pour la navigation SPA : garantit toujours le dernier index.html en ligne
// tout en restant instantanément disponible hors-ligne via le precache.
const navStrategy = new NetworkFirst({
  cacheName: "pages-navigation",
  networkTimeoutSeconds: 3,
});
registerRoute(
  new NavigationRoute(
    async (options) => {
      try {
        const res = await navStrategy.handle(options);
        if (res) return res;
      } catch {
        // Fallback hors-ligne ci-dessous
      }
      const cached = await matchPrecache("/index.html");
      return cached ?? Response.error();
    },
    {
      denylist: [/^\/api\//],
    },
  ),
);

interface PushMessagePayload {
  title?: string;
  body?: string;
  url?: string;
  tag?: string;
}

/**
 * Réception d'une notification Web Push envoyée par le backend NestJS.
 */
self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload: PushMessagePayload;
  try {
    payload = event.data.json() as PushMessagePayload;
  } catch {
    payload = { body: event.data.text() };
  }

  const title = payload.title || "Productivity";
  const options: NotificationOptions = {
    body: payload.body || "Nouvelle notification",
    icon: "/pwa-192x192.png",
    badge: "/pwa-192x192.png",
    tag: payload.tag || "productivity-notif",
    data: { url: payload.url || "/" },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

/**
 * Ouverture ou focus de l'application lors du clic sur une notification Push.
 */
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl =
    (event.notification.data as { url?: string } | undefined)?.url || "/";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then(async (clientsList) => {
        for (const client of clientsList) {
          if ("focus" in client) {
            if ("navigate" in client && targetUrl && targetUrl !== "/") {
              try {
                await client.navigate(targetUrl);
              } catch {
                // Ignore cross-origin navigate error
              }
            }
            return client.focus();
          }
        }
        return self.clients.openWindow(targetUrl);
      }),
  );
});
