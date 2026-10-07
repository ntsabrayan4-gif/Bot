const { spawn } = require("child_process");
const axios = require("axios");
const logger = require("./utils/log");
const config = require("./config.json");

/* ================= UPDATE CHECK FROM GITLAB ================= */

const REMOTE_CONFIG_URL =
  "https://gitlab.com/rajputmukku02/ARIF-BABU-v2/-/raw/main/config.json";

async function checkUpdate() {
  try {
    const res = await axios.get(REMOTE_CONFIG_URL, { timeout: 10000 });

    const remoteVersion = res.data.version; // lowercase
    const localVersion = config.version;    // lowercase

    if (!remoteVersion) {
      return logger("❌ Remote version not found", "[ UPDATE ]");
    }

    if (remoteVersion !== localVersion) {
      logger(
        `⚠️ Update available | Current: ${localVersion} → New: ${remoteVersion}`,
        "[ UPDATE ]"
      );
    } else {
      logger("✅ Bot already latest version pe hai", "[ UPDATE ]");
    }
  } catch (err) {
    logger("❌ Update check failed", "[ UPDATE ]");
  }
}

/* ================= CREATE WEBSITE FOR DASHBOARD / UPTIME ================= */

const express = require("express");
const path = require("path");

const app = express();
const port = process.env.PORT || 5000;

app.set("trust proxy", true);

app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  next();
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/index.html"));
});

app.listen(port, "0.0.0.0", () => {
  logger(`Server is running on port ${port}...`, "[ Starting ]");
}).on("error", (err) => {
  if (err.code === "EACCES") {
    logger(`Permission denied on port ${port}`, "[ Error ]");
  } else {
    logger(`Server error: ${err.message}`, "[ Error ]");
  }
});

/* ================= START BOT AND AUTO RESTART ================= */

global.countRestart = global.countRestart || 0;

function startBot(message) {
  if (message) logger(message, "[ BOT ]");

  const child = spawn(
    "node",
    ["--trace-warnings", "--async-stack-traces", "ARIF-BABU.js"],
    {
      cwd: __dirname,
      stdio: "inherit",
      shell: true
    }
  );

  child.on("close", (codeExit) => {
    if (codeExit !== 0 && global.countRestart < 5) {
      global.countRestart++;
      logger(
        `Bot exited with code ${codeExit}. Restarting... (${global.countRestart}/5)`,
        "[ RESTART ]"
      );
      startBot();
    } else {
      logger(
        `Bot stopped after ${global.countRestart} restarts.`,
        "[ STOPPED ]"
      );
    }
  });

  child.on("error", (error) => {
    logger(`Bot error: ${error.message}`, "[ ERROR ]");
  });
}

/* ================= BOOT SEQUENCE ================= */

(async () => {
  await checkUpdate();          // 🔥 update check FIRST
  startBot("Bot is starting...");
})();
