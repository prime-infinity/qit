#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { execa } from "execa";
import { fileURLToPath } from "url";
import colors from "ansi-colors";

console.log("Program started");

// Get current directory (needed for ESM)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LAST_COMMIT_FILE = path.join(__dirname, ".last_commit");

function getConfig() {
  try {
    const configPath = path.join(process.cwd(), "qit.config.json");
    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    return {
      branch: config.branch || "main",
    };
  } catch (error) {
    return {
      branch: "main",
    };
  }
}

// Get the commit message and file arguments from command line
function getCommitData() {
  const args = process.argv.slice(2);
  const filesIndex = args.indexOf("--files");

  let commitMessage, files;
  if (filesIndex !== -1) {
    // Extract commit message before "--files"
    commitMessage = args.slice(0, filesIndex).join(" ");
    // Extract file paths after "--files"
    files = args.slice(filesIndex + 1);
  } else {
    commitMessage = args.join(" ");
  }

  return { commitMessage, files };
}

async function saveLastCommitHash() {
  try {
    const { stdout: hash } = await execa("git", ["rev-parse", "HEAD"]);
    fs.writeFileSync(LAST_COMMIT_FILE, hash.trim(), "utf8");
  } catch (error) {
    console.error(colors.red("✗ Failed to save commit hash:"), error.message);
  }
}

function loadLastCommitHash() {
  try {
    return fs.readFileSync(LAST_COMMIT_FILE, "utf8").trim();
  } catch {
    return null;
  }
}

async function pushOnly(branch) {
  try {
    console.log(colors.magenta("→ Retrying push to:"), `origin/${branch}`);
    await execa("git", ["push", "origin", branch]);
    console.log(colors.green("✓ Successfully pushed!"));
    fs.unlinkSync(LAST_COMMIT_FILE);
  } catch (error) {
    console.error(colors.red("✗ Push failed again:"), error.message);
  }
}

async function gitPush(commitMessage, branch, files) {
  try {
    // Stage changes
    console.log(colors.blue("→ Staging changes..."));
    if (files && files.length > 0) {
      // Stage only the specified files
      await execa("git", ["add", ...files]);
    } else {
      // Stage all changes
      await execa("git", ["add", "."]);
    }

    // Commit with message
    console.log(
      colors.yellow("→ Committing: ") + colors.white.bold(commitMessage)
    );
    await execa("git", ["commit", "-m", commitMessage]);

    // Push to remote
    console.log(
      colors.magenta("→ Pushing to: ") + colors.white.bold(`origin/${branch}`)
    );
    await execa("git", ["push", "origin", branch]);

    console.log(colors.green("✓ Successfully pushed to remote!"));
    console.log("\n" + colors.black.bgGreen(" SUMMARY "));
    console.log(colors.green("• Branch: ") + colors.white.bold(branch));
    console.log(colors.green("• Commit: ") + colors.white.bold(commitMessage));
  } catch (error) {
    console.error("\n" + colors.white.bgRed(" ERROR "));
    console.error(
      colors.red("✗ Git operation failed: ") + colors.white.bold(error.message)
    );
    await saveLastCommitHash();
    console.log(
      colors.yellow("Hint:") +
        " Use " +
        colors.white.bold("qit p") +
        " to retry the push when you're back online."
    );
    process.exit(1);
  }
}

// Main execution
const config = getConfig();
const { commitMessage, files } = getCommitData();

if (process.argv[2] === "p") {
  const lastCommit = loadLastCommitHash();
  if (!lastCommit) {
    console.log(colors.red("✗ No previous commit to push."));
    process.exit(1);
  } else {
    pushOnly(config.branch);
  }
} else {
  if (!commitMessage) {
    console.error(colors.red("✗ Error: Please provide a commit message"));
    console.log(
      colors.yellow("Usage: ") + colors.white.bold("qit <commit message> [--files <file1> <file2> ...]")
    );
    process.exit(1);
  }

  gitPush(commitMessage, config.branch, files).catch((error) => {
    console.error(
      colors.red("✗ Unexpected error: ") + colors.white.bold(error)
    );
    process.exit(1);
  });
}
