const { spawn } = require("child_process");
const log = require("./logger/log.js");

function startProject() {
	const child = spawn("node", ["Goat.js"], {
		cwd: __dirname,
		stdio: "inherit",
		shell: true
	});

	child.on("close", (code) => {
		if (code == 2) {
			log.info("Restarting Project...");
			startProject();
		}
	});
}

startProject();
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Bot is running!');
});

app.listen(3000, () => {
  console.log('Uptime server running on port 3000');
});

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
