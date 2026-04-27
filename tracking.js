(function () {
  "use strict";

  var STORAGE_SESSION_KEY = "illirial_playtest_session";
  var STORAGE_ENDPOINT_KEY = "illirial_tracking_endpoint";

  function safeMetaEndpoint() {
    var meta = document.querySelector('meta[name="playtest-tracking-endpoint"]');
    return meta && meta.content ? meta.content.trim() : "";
  }

  function safeHost() {
    try {
      return window.location.hostname || "";
    } catch (e) {
      return "";
    }
  }

  function isLocalHost(host) {
    return host === "localhost" || host === "127.0.0.1" || host === "::1";
  }

  function randomId() {
    return (
      Date.now().toString(36) +
      "-" +
      Math.random().toString(36).slice(2, 10)
    );
  }

  function getSessionId() {
    var id = "";
    try {
      id = localStorage.getItem(STORAGE_SESSION_KEY) || "";
      if (!id) {
        id = randomId();
        localStorage.setItem(STORAGE_SESSION_KEY, id);
      }
    } catch (e) {
      id = randomId();
    }
    return id;
  }

  function readEndpoint() {
    var url =
      (window.ILLIRIAL_TRACKING_ENDPOINT || "").trim() ||
      safeMetaEndpoint() ||
      (function () {
        try {
          return (localStorage.getItem(STORAGE_ENDPOINT_KEY) || "").trim();
        } catch (e) {
          return "";
        }
      })();
    return url;
  }

  var endpoint = readEndpoint();
  var host = safeHost();
  var forceLocal = /(?:\?|&)track_local=1(?:&|$)/.test(window.location.search || "");
  var enabled = !!endpoint && (!isLocalHost(host) || forceLocal);
  var sessionId = getSessionId();

  function send(payload) {
    if (!enabled) return;
    var body = JSON.stringify(payload);
    try {
      if (navigator.sendBeacon) {
        var blob = new Blob([body], { type: "application/json" });
        navigator.sendBeacon(endpoint, blob);
        return;
      }
    } catch (e) {
      // Fall through to fetch
    }
    try {
      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body,
        keepalive: true,
      });
    } catch (e) {
      // no-op
    }
  }

  function track(eventName, data) {
    if (!enabled || !eventName) return;
    send({
      event: eventName,
      ts: new Date().toISOString(),
      sessionId: sessionId,
      host: host,
      path: window.location.pathname,
      payload: data || {},
    });
  }

  window.PlaytestTracker = {
    enabled: enabled,
    endpoint: endpoint,
    sessionId: sessionId,
    track: track,
    setEndpoint: function (url) {
      try {
        localStorage.setItem(STORAGE_ENDPOINT_KEY, (url || "").trim());
      } catch (e) {
        // no-op
      }
    },
  };

  track("page_view", {
    title: document.title || "",
    referrer: document.referrer || "",
  });
})();
