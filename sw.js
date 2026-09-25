/* =========================================================
   SEBU DOLLAR AI — BACKGROUND NOTIFICATION SERVICE WORKER
   =========================================================
   IMPORTANT:
   - Worker ini HANYA menangani background Web Push.
   - Tidak menghitung signal.
   - Tidak mengubah logika M30.
   - Tidak mengubah Entry / SL / TP.
   - Tidak mengubah History / HIT TP / HIT SL.
   ========================================================= */

const CACHE_NAME = "sebu-dollar-ai-notification-v1";

/* INSTALL */
self.addEventListener("install", function(event) {
  event.waitUntil(
    self.skipWaiting()
  );
});

/* ACTIVATE */
self.addEventListener("activate", function(event) {
  event.waitUntil(
    self.clients.claim()
  );
});

/* =========================================================
   WEB PUSH
   ========================================================= */

self.addEventListener("push", function(event) {

  let data = {};

  try {

    if (event.data) {
      data = event.data.json();
    }

  } catch (e) {

    try {

      data = {
        body: event.data
          ? event.data.text()
          : "Signal AI terkonfirmasi."
      };

    } catch (ignore) {

      data = {};

    }

  }

  const title =
    data.title ||
    "SEBU DOLLAR AI — SIGNAL";

  const body =
    data.body ||
    "Signal valid baru terdeteksi.";

  const targetUrl =
    data.url ||
    "./";

  const options = {

    body: body,

    ...(data.icon ? {icon: data.icon} : {}),
    ...(data.badge ? {badge: data.badge} : {}),

    tag:
      data.tag ||
      ("sebu-dollar-signal-" + Date.now()),

    renotify: true,

    requireInteraction: true,

    /*
      false = minta browser/Android memainkan
      suara notification sesuai pengaturan sistem.
    */
    silent: false,

    vibrate: [
      250,
      120,
      250,
      120,
      500
    ],

    timestamp: Date.now(),

    data: {
      url: targetUrl
    }

  };

  event.waitUntil(

    self.registration.showNotification(
      title,
      options
    )

  );

});

/* =========================================================
   NOTIFICATION CLICK
   ========================================================= */

self.addEventListener(
  "notificationclick",
  function(event) {

    event.notification.close();

    const targetUrl =
      event.notification.data &&
      event.notification.data.url
        ? event.notification.data.url
        : "./";

    event.waitUntil(

      self.clients.matchAll({
        type: "window",
        includeUncontrolled: true
      })

      .then(function(clients) {

        /*
          Jika AI masih terbuka/minimized,
          fokus kembali ke tab tersebut.
        */
        for (
          let i = 0;
          i < clients.length;
          i++
        ) {

          const client = clients[i];

          if (
            "focus" in client
          ) {

            return client.focus();

          }

        }

        /*
          Jika tidak ada tab AI,
          buka halaman AI.
        */
        if (
          self.clients.openWindow
        ) {

          return self.clients.openWindow(
            targetUrl
          );

        }

      })

    );

  }
);

/* =========================================================
   NOTIFICATION CLOSE
   ========================================================= */

self.addEventListener(
  "notificationclose",
  function(event) {

    /* Tidak melakukan apa-apa.
       Menutup notification tidak memengaruhi
       signal engine maupun History. */

  }
);
