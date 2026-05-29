const HOST_NAME = "com.quicksave.host";

chrome.runtime.onInstalled.addListener(async () => {
  await ensureDefaultFolders();
  await refreshMenus();
});

async function ensureDefaultFolders() {
  const data = await chrome.storage.sync.get("folders");

  if (!data.folders) {
    await chrome.storage.sync.set({
      folders: [
        {
          id: crypto.randomUUID(),
          name: "Anime",
          path: "D:\\Anime",
        },
        {
          id: crypto.randomUUID(),
          name: "Memes",
          path: "D:\\Memes",
        },
      ],
    });
  }
}

async function refreshMenus() {
  chrome.contextMenus.removeAll(async () => {
    chrome.contextMenus.create({
      id: "root",
      title: "Quick save image to...",
      contexts: ["image"],
    });

    const data = await chrome.storage.sync.get("folders");

    const folders = data.folders || [];

    folders.forEach((folder) => {
      chrome.contextMenus.create({
        id: folder.id,
        parentId: "root",
        title: folder.name,
        contexts: ["image"],
      });
    });
  });
}

chrome.runtime.onMessage.addListener(async (msg) => {
  if (msg.type === "REFRESH_MENUS") {
    await refreshMenus();
  }
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!info.srcUrl) return;

  const data = await chrome.storage.sync.get("folders");

  const folders = data.folders || [];

  const folder = folders.find((f) => f.id === info.menuItemId);

  if (!folder) return;

  const payload = {
    type: "saveImage",
    imageUrl: info.srcUrl,
    savePath: folder.path,
  };

  chrome.runtime.sendNativeMessage(HOST_NAME, payload, (response) => {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError.message);
      chrome.tabs.sendMessage(tab.id, {
        type: "SHOW_TOAST",
        success: false,
        text: "❌ Save failed",
      });

      return;
    }

    console.log("Saved:", response);
    chrome.tabs.sendMessage(
      tab.id,
      {
        type: "SHOW_TOAST",
        success: true,
        text: `✅ Saved to ${folder.name}`,
      },
      () => {
        if (chrome.runtime.lastError) {
          console.log(
            "Toast delivery failed:",
            chrome.runtime.lastError.message,
          );
        }
      },
    );
  });
});
