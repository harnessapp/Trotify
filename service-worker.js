
self.addEventListener("install", event => {
    self.skipWaiting();
});

self.addEventListener("activate", event => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", event => {
    // Network-first for now.
});

// Receive push notifications
self.addEventListener("push", event => {
    let data = {};

    try {
        data = event.data ? event.data.json() : {};
    } catch (error) {
        console.error("Invalid push payload:", error);
    }

    const title = data.title || "Trotify Tip Alert";

    const options = {
        body: data.body || "A Trotify tip is coming up!",
        icon: "/icons/icon-192.png",
        badge: "/icons/icon-192.png",
        tag: data.tag || "trotify-tip",
        data: {
            url: data.url || "/"
        }
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// Open Trotify when notification is tapped
self.addEventListener("notificationclick", event => {
    event.notification.close();

    const url = new URL(
        event.notification.data?.url || "/",
        self.location.origin
    );

    // Only allow navigation within Trotify
    if (url.origin !== self.location.origin) {
        return;
    }

    event.waitUntil(
        (async () => {
            const clientsList = await self.clients.matchAll({
                type: "window",
                includeUncontrolled: true
            });

            for (const client of clientsList) {
                if (client.url === url.href && "focus" in client) {
                    return client.focus();
                }
            }

            return self.clients.openWindow(url.href);
        })()
    );
});
