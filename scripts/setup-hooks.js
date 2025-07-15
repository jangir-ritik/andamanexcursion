#!/usr/bin/env node

/**
 * Git Hooks Setup Script
 *
 * This script sets up Git hooks for the project.
 * It creates a pre-commit hook that checks components before allowing a commit.
 * The hooks are optional and can be skipped if the user chooses.
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import readline from "readline";

const HOOKS_DIR = path.join(".git", "hooks");
const PRE_COMMIT_HOOK = path.join(HOOKS_DIR, "pre-commit");

// Create a readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Function to ask user if they want to set up hooks
const askToSetupHooks = () => {
  return new Promise((resolve) => {
    // Check if this is running in CI or non-interactive environment
    if (process.env.CI || process.env.GITHUB_ACTIONS || !process.stdin.isTTY) {
      console.log(
        "Running in non-interactive environment, skipping hook setup prompt."
      );
      resolve(false);
      return;
    }

    rl.question(
      "Would you like to set up Git hooks for component checking? (y/N): ",
      (answer) => {
        resolve(answer.toLowerCase() === "y");
      }
    );
  });
};

// Create the pre-commit hook
const createPreCommitHook = () => {
  // Ensure hooks directory exists
  if (!fs.existsSync(HOOKS_DIR)) {
    fs.mkdirSync(HOOKS_DIR, { recursive: true });
  }

  // Create the pre-commit hook
  const hookContent = `#!/bin/sh
# Pre-commit hook for Andaman Excursion project
# This hook checks components before allowing a commit

echo "🔍 Checking staged components..."
node ./scripts/component-checker.js --staged

if [ $? -ne 0 ]; then
  echo "❌ Component check failed. Please fix the issues before committing."
  exit 1
fi

echo "✅ Component check passed!"
`;

  fs.writeFileSync(PRE_COMMIT_HOOK, hookContent);
  fs.chmodSync(PRE_COMMIT_HOOK, "755");
  console.log("✅ Pre-commit hook created successfully!");
};

// Main function
const main = async () => {
  try {
    // Check if Git is initialized
    if (!fs.existsSync(".git")) {
      console.log(
        "Git is not initialized in this directory. Skipping hook setup."
      );
      return;
    }

    const shouldSetupHooks = await askToSetupHooks();

    if (shouldSetupHooks) {
      createPreCommitHook();
      console.log("Git hooks have been set up successfully!");
    } else {
      console.log(
        "Git hooks setup skipped. You can run 'npm run setup-hooks' later if needed."
      );
    }
  } catch (error) {
    console.error("Error setting up Git hooks:", error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
};

main();
