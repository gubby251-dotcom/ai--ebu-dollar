const CACHE_NAME = "sebu-dollar-ai-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let data = {};

  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = {
      title: "SEBU DOLLAR AI",
      body: event.data ? event.data.text() : "Signal baru terdeteksi"
    };
  }

  const title = data.title || "SEBU DOLLAR AI";
  const options = {
    body: data.body || "Signal valid XAUUSD terdeteksi",
    icon: data.icon || "./icon-192.png",
    badge: data.badge || "./icon-192.png",
    tag: data.tag || "sebu-dollar-ai-signal",
    renotify: true,
    requireInteraction: true,
    silent: false,
    vibrate: [300, 150, 300, 150, 500],
    data: {
      url: data.url || "./",
      signal: data.signal || ""
    }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl =
    event.notification.data?.url || "./";

  event.waitUntil(
    clients.matchAll({
      type: "window",
      includeUncontrolled: true
    }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          return client.focus();
        }
      }

      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
