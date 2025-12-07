self.addEventListener("push", event => {
  let data = {};
  try { data = event.data.json(); } catch {}

  event.waitUntil(
    self.registration.showNotification(data.title || "Update", {
      body: data.body || "",
      icon: "/logo.png",
      data,
    })
  );
});
