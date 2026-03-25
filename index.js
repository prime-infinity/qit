#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { execa } from "execa";
import { fileURLToPath } from "url";
import colors from "ansi-colors";
console.log("program started");
// Get current directory (needed for ESM)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LAST_COMMIT_FILE = path.join(__dirname, ".last_commit");

async function getCurrentBranch() {
  try {
    const { stdout } = await execa("git", ["rev-parse", "--abbrev-ref", "HEAD"]);
    return stdout.trim();
  } catch (error) {
    console.error(colors.red("✗ Failed to get current branch:"), error.message);
    process.exit(1);
  }
}

// Get the commit message from command line arguments
function getCommitMessage() {
  // process.argv is an array containing command line arguments
  // [0] = node executable path
  // [1] = script path
  // [2] and onwards = actual arguments we want
  const args = process.argv.slice(2);

  // Join all arguments into a single message
  // This allows messages with spaces like "fixed screen size"
  return args.join(" ");
}

// Save the last commit hash to a file
async function saveLastCommitHash() {
  try {
    const { stdout: hash } = await execa("git", ["rev-parse", "HEAD"]);
    fs.writeFileSync(LAST_COMMIT_FILE, hash.trim(), "utf8");
  } catch (error) {
    console.error(colors.red("✗ Failed to save commit hash:"), error.message);
  }
}

// Load the last commit hash from the file
function loadLastCommitHash() {
  try {
    return fs.readFileSync(LAST_COMMIT_FILE, "utf8").trim();
  } catch {
    return null;
  }
}

// Push only (for `qit p` command)
async function pushOnly(branch) {
  try {
    console.log(colors.magenta("→ Retrying push to:"), `origin/${branch}`);
    await execa("git", ["push", "origin", branch]);
    console.log(colors.green("✓ Successfully pushed!"));
    fs.unlinkSync(LAST_COMMIT_FILE); // Clear the saved commit hash on success
  } catch (error) {
    console.error(colors.red("✗ Push failed again:"), error.message);
  }
}

// Main function to handle Git operations
async function gitPush(commitMessage, branch) {
  try {
    // Stage changes
    console.log(colors.blue("→ Staging changes..."));
    await execa("git", ["add", "."]);

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

    // Show success summary
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
(async () => {
  const branch = await getCurrentBranch();
  const commitMessage = getCommitMessage();

  // Check if the command is `qit p` to retry the push
  if (process.argv[2] === "p") {
    const lastCommit = loadLastCommitHash();
    if (!lastCommit) {
      console.log(colors.red("✗ No previous commit to push."));
      process.exit(1);
    } else {
      await pushOnly(branch);
    }
  } else {
    if (!commitMessage) {
      console.error(colors.red("✗ Error: Please provide a commit message"));
      console.log(
        colors.yellow("Usage: ") + colors.white.bold("qit <commit message>")
      );
      process.exit(1); // Exit with error code
    }

    // Since we're using async/await, we need to wrap our execution
    await gitPush(commitMessage, branch).catch((error) => {
      console.error(
        colors.red("✗ Unexpected error: ") + colors.white.bold(error)
      );
      process.exit(1);
    });
  }
})();
