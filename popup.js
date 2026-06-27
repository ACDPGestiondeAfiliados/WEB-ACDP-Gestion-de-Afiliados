let deferredPrompt;

// Detecta si la PWA puede instalarse
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;

  const yaVisto = localStorage.getItem("acdp_pwa_seen");

  const yaInstalada = window.matchMedia('(display-mode: standalone)').matches;

  if (!yaVisto && !yaInstalada) {
    mostrarPopupInstalacion();
    localStorage.setItem("acdp_pwa_seen", "1");
  }
});

function mostrarPopupInstalacion() {
  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.background = "rgba(0,0,0,0.6)";
  overlay.style.display = "flex";
  overlay.style.justifyContent = "center";
  overlay.style.alignItems = "center";
  overlay.style.zIndex = "99999";

  const box = document.createElement("div");
  box.style.background = "#fff";
  box.style.padding = "20px";
  box.style.borderRadius = "12px";
  box.style.width = "300px";
  box.style.textAlign = "center";
  box.style.fontFamily = "sans-serif";

  box.innerHTML = `
    <h3>Instalar ACDP</h3>
    <p>Accede más rápido instalando la aplicación.</p>
    <button id="btnInstallPWA" style="margin:10px;padding:10px;width:100%;">
      Instalar
    </button>
    <button id="btnClosePWA" style="padding:10px;width:100%;">
      Ahora no
    </button>
  `;

  overlay.appendChild(box);
  document.body.appendChild(overlay);

  document.getElementById("btnClosePWA").onclick = () => {
    overlay.remove();
  };

  document.getElementById("btnInstallPWA").onclick = async () => {
    overlay.remove();

    if (!deferredPrompt) return;

    deferredPrompt.prompt();

    await deferredPrompt.userChoice;
    deferredPrompt = null;
  };
}
