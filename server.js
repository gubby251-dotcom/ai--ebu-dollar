const express = require("express");
const webpush = require("web-push");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

/* =========================================================
   VAPID CONFIGURATION
   ========================================================= */

const VAPID_PUBLIC_KEY =
  process.env.VAPID_PUBLIC_KEY || "";

const VAPID_PRIVATE_KEY =
  process.env.VAPID_PRIVATE_KEY || "";

const VAPID_SUBJECT =
  process.env.VAPID_SUBJECT ||
  "mailto:admin@example.com";

if (
  !VAPID_PUBLIC_KEY ||
  !VAPID_PRIVATE_KEY
) {

  console.warn(
    "WARNING: VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY belum diatur."
  );

} else {

  webpush.setVapidDetails(
    VAPID_SUBJECT,
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );

}

/* =========================================================
   DEVICE SUBSCRIPTIONS
   ========================================================= */

const subscriptions = new Map();

/* =========================================================
   HEALTH CHECK
   ========================================================= */

app.get("/", function(req, res) {

  res.json({
    ok: true,
    service: "SEBU DOLLAR AI PUSH SERVER"
  });

});

/* =========================================================
   PUBLIC VAPID KEY
   ========================================================= */

app.get("/vapid-public-key", function(req, res) {

  if (!VAPID_PUBLIC_KEY) {

    return res.status(500).json({
      ok: false,
      error: "VAPID public key belum dikonfigurasi."
    });

  }

  res.json({
    ok: true,
    publicKey: VAPID_PUBLIC_KEY
  });

});

/* =========================================================
   REGISTER DEVICE
   ========================================================= */

app.post("/subscribe", function(req, res) {

  try {

    const subscription = req.body;

    if (
      !subscription ||
      !subscription.endpoint
    ) {

      return res.status(400).json({
        ok: false,
        error: "Push subscription tidak valid."
      });

    }

    subscriptions.set(
      subscription.endpoint,
      subscription
    );

    console.log(
      "Push subscription registered:",
      subscription.endpoint
    );

    res.json({
      ok: true,
      message: "Device berhasil terdaftar."
    });

  } catch (error) {

    console.error(
      "Subscribe error:",
      error
    );

    res.status(500).json({
      ok: false,
      error: "Gagal menyimpan subscription."
    });

  }

});

/* =========================================================
   SEND PUSH
   ========================================================= */

app.post("/send-signal", async function(req, res) {

  try {

    const {
      title,
      body,
      url
    } = req.body || {};

    if (!title || !body) {

      return res.status(400).json({
        ok: false,
        error: "title dan body wajib diisi."
      });

    }

    if (
      !VAPID_PUBLIC_KEY ||
      !VAPID_PRIVATE_KEY
    ) {

      return res.status(500).json({
        ok: false,
        error: "VAPID key belum dikonfigurasi."
      });

    }

    const payload = JSON.stringify({

      title:
        title ||
        "SEBU DOLLAR AI — SIGNAL",

      body:
        body ||
        "Signal valid baru terdeteksi.",

      url:
        url ||
        "/",

      tag:
        "sebu-dollar-signal-" +
        Date.now()

    });

    const results = [];

    for (
      const [
        endpoint,
        subscription
      ]
      of subscriptions.entries()
    ) {

      try {

        await webpush.sendNotification(
          subscription,
          payload
        );

        results.push({
          endpoint,
          ok: true
        });

      } catch (error) {

        console.error(
          "Push failed:",
          error.statusCode,
          error.message
        );

        /*
          Subscription sudah tidak valid.
          Hapus agar tidak terus dicoba.
        */
        if (
          error.statusCode === 404 ||
          error.statusCode === 410
        ) {

          subscriptions.delete(
            endpoint
          );

        }

        results.push({
          endpoint,
          ok: false,
          statusCode:
            error.statusCode || null
        });

      }

    }

    res.json({

      ok: true,

      sent:
        results.filter(
          r => r.ok
        ).length,

      total:
        results.length,

      results

    });

  } catch (error) {

    console.error(
      "Send signal error:",
      error
    );

    res.status(500).json({
      ok: false,
      error: error.message
    });

  }

});

/* =========================================================
   SERVER START
   ========================================================= */

const PORT =
  process.env.PORT || 3000;

app.listen(
  PORT,
  function() {

    console.log(
      "SEBU DOLLAR AI Push Server running on port",
      PORT
    );

  }
);
