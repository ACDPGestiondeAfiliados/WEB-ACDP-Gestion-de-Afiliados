let deferredPrompt = null;

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("btnInstalarApp");

  if (!btn) return;

  // Detecta si ya está instalada
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;

  if (isStandalone) {
    btn.textContent = "✔ App ya instalada";
    btn.disabled = true;
    return;
  }

  // Detecta si PWA puede instalarse
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;

    btn.textContent = "📲 Instalar Aplicación";
    btn.disabled = false;
  });

  // Estado inicial (antes de que Chrome dispare el evento)
  btn.textContent = "⏳ Preparando instalación...";
  btn.disabled = true;

  // Click del botón
  btn.addEventListener("click", async () => {
    try {
      if (!deferredPrompt) {
        btn.textContent = "⚠ No disponible aún";
        setTimeout(() => {
          btn.textContent = "📲 Bajar Aplicación";
        }, 2000);
        return;
      }

      deferredPrompt.prompt();

      const result = await deferredPrompt.userChoice;

      if (result.outcome === "accepted") {
        btn.textContent = "✔ Instalando...";
      } else {
        btn.textContent = "❌ Instalación cancelada";
      }

      deferredPrompt = null;

    } catch (err) {
      console.error("Error instalación PWA:", err);
      btn.textContent = "⚠ Error";
    }
  });
});
