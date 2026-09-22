/* SEBU DOLLAR AI - Background Notification Service Worker */

self.addEventListener("install", function(event) {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", function(event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", function(event) {
  var data = {};

  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = {
      body: event.data
        ? event.data.text()
        : "Signal valid baru terdeteksi."
    };
  }

  var title = data.title || "SEBU DOLLAR AI";
  var body = data.body || "Signal valid baru terdeteksi.";
  var url = data.url || "./";

  event.waitUntil(
    self.registration.showNotification(title, {
      body: body,
      silent: false,
      vibrate: [250, 120, 250, 120, 450],
      requireInteraction: true,
      renotify: true,
      tag: "sebu-dollar-signal",
      data: {
        url: url
      }
    })
  );
});

self.addEventListener("notificationclick", function(event) {
  event.notification.close();

  event.waitUntil(
    self.clients.matchAll({
      type: "window",
      includeUncontrolled: true
    }).then(function(clients) {

      var url =
        event.notification.data &&
        event.notification.data.url
          ? event.notification.data.url
          : "./";

      for (var i = 0; i < clients.length; i++) {
        if ("focus" in clients[i]) {
          return clients[i].focus();
        }
      }

      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});
