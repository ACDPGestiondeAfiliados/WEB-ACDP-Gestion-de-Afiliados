let deferredPrompt = null;

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("btnInstalarApp");

  if (!btn) {
    console.warn("Botón de instalación no encontrado en el DOM");
    return;
  }

  // Captura evento de instalación disponible
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
  });

  // Click siempre activo
  btn.addEventListener("click", async () => {
    try {
      // Caso 1: instalación disponible
      if (deferredPrompt) {
        deferredPrompt.prompt();

        const result = await deferredPrompt.userChoice;

        console.log("Resultado instalación:", result.outcome);

        deferredPrompt = null;
        return;
      }

      // Caso 2: no disponible aún
      alert("La instalación no está disponible en este momento. Intenta nuevamente luego.");
    } catch (err) {
      console.error("Error al intentar instalar PWA:", err);
    }
  });
});
