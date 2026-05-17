import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const envFilePath = path.join(projectRoot, ".env");

const parseEnvFile = (content) => {
  const env = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex <= 0) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();
    env[key] = value;
  }

  return env;
};

const fileEnv = existsSync(envFilePath)
  ? parseEnvFile(readFileSync(envFilePath, "utf8"))
  : {};

const runMode = process.argv[2] || "dev";
const port = fileEnv.PORT || process.env.PORT;

if ((runMode === "dev" || runMode === "preview") && !port) {
  console.error("Missing PORT in frontend/.env");
  process.exit(1);
}

let viteArgs = [];

if (runMode === "dev") {
  viteArgs = ["vite", "--port", port, "--strictPort"];
} else if (runMode === "build") {
  viteArgs = ["vite", "build"];
} else if (runMode === "preview") {
  viteArgs = ["vite", "preview", "--port", port, "--strictPort"];
} else {
  console.error(`Unknown command: ${runMode}`);
  process.exit(1);
}

const spawnCommand = process.platform === "win32" ? "cmd.exe" : "npx";
const args =
  process.platform === "win32"
    ? ["/c", "npx", ...viteArgs]
    : ["vite", ...viteArgs.slice(1)];

const child = spawn(spawnCommand, args, {
  cwd: projectRoot,
  stdio: "inherit",
  env: {
    ...process.env,
    ...fileEnv,
  },
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
