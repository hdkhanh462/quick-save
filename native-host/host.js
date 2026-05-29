import fs from "fs";
import path from "path";
import axios from "axios";

function sendMessage(msg) {
  const json = JSON.stringify(msg);

  const lengthBuffer = Buffer.alloc(4);

  lengthBuffer.writeUInt32LE(Buffer.byteLength(json), 0);

  process.stdout.write(lengthBuffer);
  process.stdout.write(json);
}

function readMessage() {
  return new Promise((resolve) => {
    process.stdin.once("readable", () => {
      const lengthBuffer = process.stdin.read(4);

      const length = lengthBuffer.readUInt32LE(0);

      const messageBuffer = process.stdin.read(length);

      const message = JSON.parse(messageBuffer.toString());

      resolve(message);
    });
  });
}

function ensureFolder(folderPath) {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
}

function generateFilename(url) {
  try {
    const parsed = new URL(url);

    let filename = path.basename(parsed.pathname);

    if (!filename.includes(".")) {
      filename = `image_${Date.now()}.jpg`;
    }

    return filename;
  } catch {
    return `image_${Date.now()}.jpg`;
  }
}

function getUniqueFilePath(folder, filename) {
  const ext = path.extname(filename);

  const base = path.basename(filename, ext);

  let fullPath = path.join(folder, filename);

  let counter = 1;

  while (fs.existsSync(fullPath)) {
    fullPath = path.join(folder, `${base}_${counter}${ext}`);

    counter++;
  }

  return fullPath;
}

async function downloadImage(url, outputPath) {
  const response = await axios({
    method: "GET",
    url,
    responseType: "stream",
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
  });

  const writer = fs.createWriteStream(outputPath);

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);

    writer.on("error", reject);
  });
}

async function handleMessage(msg) {
  if (msg.type !== "saveImage") {
    return;
  }

  const folder = msg.savePath;

  ensureFolder(folder);

  const filename = generateFilename(msg.imageUrl);

  const fullPath = getUniqueFilePath(folder, filename);

  await downloadImage(msg.imageUrl, fullPath);

  sendMessage({
    success: true,
    path: fullPath,
  });
}

(async () => {
  while (true) {
    try {
      const msg = await readMessage();

      await handleMessage(msg);
    } catch (err) {
      sendMessage({
        success: false,
        error: err.message,
      });
    }
  }
})();
