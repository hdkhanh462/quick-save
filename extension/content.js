chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "SHOW_TOAST") {
    showToast(msg.text, msg.success);
  }
});

function showToast(text, success = true) {
  const toast = document.createElement("div");

  toast.textContent = text;

  toast.style.position = "fixed";
  toast.style.top = "20px";
  toast.style.right = "20px";
  toast.style.zIndex = "999999";

  toast.style.padding = "12px 16px";
  toast.style.borderRadius = "10px";

  toast.style.fontSize = "14px";
  toast.style.fontFamily = "Arial";

  toast.style.color = "white";

  toast.style.background = success ? "#16a34a" : "#dc2626";

  toast.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";

  toast.style.opacity = "0";
  toast.style.transition = "all 0.2s ease";

  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateY(0)";
  });

  setTimeout(() => {
    toast.style.opacity = "0";

    setTimeout(() => {
      toast.remove();
    }, 200);
  }, 2500);
}
