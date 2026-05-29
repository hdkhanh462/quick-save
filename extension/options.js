async function loadFolders() {
  const data = await chrome.storage.sync.get("folders");

  const folders = data.folders || [];

  const list = document.getElementById("list");

  list.innerHTML = "";

  folders.forEach((folder) => {
    const div = document.createElement("div");

    div.className = "item";

    div.innerHTML = `
      <strong>${folder.name}</strong>
      <br>
      ${folder.path}
      <br><br>
      <button data-id="${folder.id}">Delete</button>
    `;

    div.querySelector("button").onclick = async () => {
      const newFolders = folders.filter((f) => f.id !== folder.id);

      await chrome.storage.sync.set({
        folders: newFolders,
      });

      chrome.runtime.sendMessage({
        type: "REFRESH_MENUS",
      });

      loadFolders();
    };

    list.appendChild(div);
  });
}

document.getElementById("addBtn").onclick = async () => {
  const name = document.getElementById("name").value.trim();

  const path = document.getElementById("path").value.trim();

  if (!name || !path) {
    alert("Missing fields");
    return;
  }

  const data = await chrome.storage.sync.get("folders");

  const folders = data.folders || [];

  folders.push({
    id: crypto.randomUUID(),
    name,
    path,
  });

  await chrome.storage.sync.set({
    folders,
  });

  chrome.runtime.sendMessage({
    type: "REFRESH_MENUS",
  });

  document.getElementById("name").value = "";
  document.getElementById("path").value = "";

  loadFolders();
};

loadFolders();
