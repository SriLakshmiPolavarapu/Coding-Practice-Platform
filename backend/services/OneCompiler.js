import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { promisify } from "util";
import { fileURLToPath } from "url";

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tmpDir = path.resolve(__dirname, "../tmp");

// Create tmp folder if it doesn't exist
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

const LANGUAGE_CONFIG = {
  python: { ext: "py", cmd: (file) => `python3 ${file}` },
  javascript: { ext: "js", cmd: (file) => `node ${file}` },
};

export async function executeCode({ language, code }) {
  const config = LANGUAGE_CONFIG[language];
  if (!config) return `Unsupported language: ${language}`;

  const filename = `code_${Date.now()}.${config.ext}`;
  const filepath = path.join(tmpDir, filename);

  try {
    // Write code to temp file
    fs.writeFileSync(filepath, code);

    // Execute it
    const { stdout, stderr } = await execAsync(config.cmd(filepath), {
      timeout: 5000 // 5 second timeout
    });

    return stderr ? stderr : stdout;
  } catch (err) {
    return err.stderr || err.message || "Execution Error";
  } finally {
    // Clean up temp file
    if (fs.existsSync(filepath)) fs.unlink(filepath, () => {});
  }
}
