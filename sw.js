/* SEBU DOLLAR AI - Background Notification Service Worker */

self.addEventListener("install", function(event) {
  self.skipWaiting();
});

self.addEventListener("activate", function(event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("notificationclick", function(event) {
  event.notification.close();

  event.waitUntil(
    self.clients.matchAll({
      type: "window",
      includeUncontrolled: true
    }).then(function(clients) {

      for (var i = 0; i < clients.length; i++) {
        if ("focus" in clients[i]) {
          return clients[i].focus();
        }
      }

      if (self.clients.openWindow) {
        var url = "./";

        if (
          event.notification.data &&
          event.notification.data.url
        ) {
          url = event.notification.data.url;
        }

        return self.clients.openWindow(url);
      }

    })
  );
});
