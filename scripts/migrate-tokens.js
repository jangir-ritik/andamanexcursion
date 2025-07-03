#!/usr/bin/env node

/**
 * CSS Custom Properties Migration Script
 * This script helps migrate from old token names to new ones across your codebase
 */

const fs = require("fs");
const path = require("path");

// Complete mapping of old tokens to new tokens
const TOKEN_MAPPINGS = {
  // Colors - Primary/Secondary/Tertiary
  "--color-primary": "--color-primary",
  "--color-primary-dark": "--color-primary-hover",
  "--color-primary-light": "--color-primary-light",
  "--color-secondary": "--color-secondary",
  "--color-secondary-dark": "--color-secondary-hover",
  "--color-tertiary": "--color-tertiary",
  "--color-disable": "--color-text-disabled",
  "--color-white": "--color-white",
  "--color-black": "--color-black",

  // Text Colors
  "--color-text-primary": "--color-text-primary",
  "--color-text-secondary": "--color-text-secondary",

  // Background Colors
  "--color-foreground-dark": "--color-bg-tertiary",
  "--color-foreground-light": "--color-bg-secondary",

  // Border Colors
  "--color-border": "--color-border-primary",
  "--color-border-2": "--color-border-secondary",
  "--color-border-3": "--color-border-tertiary",
  "--color-focus": "--color-border-focus",
  "--color-divider": "--color-divider",
  "--color-exclude-circle": "--color-exclude-light",

  // Testimonial Colors
  "--color-testimonial-border": "--color-testimonial-border",
  "--color-testimonial-text": "--color-testimonial-text",
  "--color-testimonial-divider": "--color-testimonial-divider",
  "--testimonial-card-width": "--size-testimonial-card-width",
  "--testimonial-card-height": "--size-testimonial-card-height",
  "--testimonial-rotation-angle": "--testimonial-rotation",

  // Typography
  "--font-size-xs": "--font-size-xs",
  "--font-size-sm": "--font-size-sm",
  "--font-size-md": "--font-size-base",
  "--font-size-lg": "--font-size-lg",
  "--font-size-xl": "--font-size-xl",
  "--font-size-2xl": "--font-size-2xl",
  "--font-size-3xl": "--font-size-3xl",
  "--font-size-4xl": "--font-size-4xl",
  "--font-size-5xl": "--font-size-5xl",

  // Legacy font sizes
  "--font-size-h1": "--font-size-heading-1",
  "--font-size-h2": "--font-size-heading-2",
  "--font-size-subheading-1": "--font-size-xl",
  "--font-size-subheading-2": "--font-size-2xl",
  "--font-size-body-1": "--font-size-body-large",
  "--font-size-body-2": "--font-size-body-base",
  "--font-size-body-3": "--font-size-body-small",
  "--font-size-body-4": "--font-size-caption",
  "--font-size-button": "--font-size-button",

  // Font Families
  "--font-family-jakarta": "--font-family-primary",
  "--font-family-quick-beach": "--font-family-display",
  "--font-quick-beach": "--font-family-display",

  // Shadows
  "--box-shadow-1": "--shadow-elevated",
  "--box-shadow-2": "--shadow-card",

  // Container
  "--container-max-width": "--layout-container-max-width",
  "--container-padding": "--layout-container-padding",

  // Spacing - Atomic unit conversions
  "--atomic-unit": "--space-unit",
  "--section-gap": "--space-section",

  // Gap mappings
  "--gap-0": "--space-0",
  "--gap-half-unit": "--space-1",
  "--gap-1": "--space-2",
  "--gap-1-half": "--space-3",
  "--gap-2": "--space-4",
  "--gap-2-half": "--space-5",
  "--gap-3": "--space-6",
  "--gap-4": "--space-8",
  "--gap-5": "--space-10",
  "--gap-6": "--space-12",
  "--gap-7": "--space-14",
  "--gap-8": "--space-16",
  "--gap-9": "--space-18",
  "--gap-10": "--space-20",

  // Padding mappings (same as gap)
  "--padding-0": "--space-0",
  "--padding-half": "--space-1",
  "--padding-1": "--space-2",
  "--padding-1-half": "--space-3",
  "--padding-2": "--space-4",
  "--padding-2-half": "--space-5",
  "--padding-3": "--space-6",
  "--padding-4": "--space-8",
  "--padding-5": "--space-10",
  "--padding-6": "--space-12",
  "--padding-7": "--space-14",
  "--padding-8": "--space-16",
  "--padding-9": "--space-18",
  "--padding-10": "--space-20",

  // Margin mappings (same as gap)
  "--margin-0": "--space-0",
  "--margin-1": "--space-2",
  "--margin-2": "--space-4",
  "--margin-3": "--space-6",
  "--margin-4": "--space-8",
  "--margin-5": "--space-10",
  "--margin-6": "--space-12",
  "--margin-7": "--space-14",
  "--margin-8": "--space-16",

  // Border radius
  "--border-radius-0": "--radius-none",
  "--border-radius-1": "--radius-sm",
  "--border-radius-1-half": "--radius-base",
  "--border-radius-2": "--radius-md",
  "--border-radius-3": "--radius-lg",
  "--border-radius-4": "--radius-xl",
  "--border-radius-5": "--radius-2xl",

  // Image border radius
  "--border-radius-image-small": "--radius-image-small",
  "--border-radius-image-medium": "--radius-image-medium",
  "--border-radius-image-large": "--radius-image-large",
  "--border-radius-image-xl": "--radius-image-xl",
  "--border-radius-image-top-left": "--radius-image-asymmetric",
  "--border-radius-image-top-right": "--radius-none",
  "--border-radius-image-bottom-left": "--radius-none",
  "--border-radius-image-bottom-right": "--radius-image-small",

  // Component sizes
  "--formfield-min-width": "--size-form-field-min-width",
  "--formfield-height": "--size-form-field-height",
  "--floating-button-size": "--size-floating-button",
  "--divider-height": "--size-divider-height",
};

// File extensions to process
const FILE_EXTENSIONS = [
  ".css",
  ".scss",
  ".sass",
  ".less",
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".vue",
  ".svelte",
  ".html",
];

/**
 * Recursively find all files with specified extensions
 */
function findFiles(dir, extensions) {
  const files = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // Skip node_modules and .git directories
      if (item !== "node_modules" && item !== ".git" && !item.startsWith(".")) {
        files.push(...findFiles(fullPath, extensions));
      }
    } else if (extensions.some((ext) => item.endsWith(ext))) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Replace tokens in a file
 */
function replaceTokensInFile(filePath, mappings) {
  let content = fs.readFileSync(filePath, "utf8");
  let changed = false;

  // Sort mappings by length (longest first) to avoid partial replacements
  const sortedMappings = Object.entries(mappings).sort(
    ([a], [b]) => b.length - a.length
  );

  for (const [oldToken, newToken] of sortedMappings) {
    // Create regex patterns for different contexts
    const patterns = [
      // CSS custom property usage: var(--old-token)
      new RegExp(`var\\(\\s*${escapeRegExp(oldToken)}\\s*\\)`, "g"),
      // CSS custom property definition: --old-token:
      new RegExp(`${escapeRegExp(oldToken)}(?=\\s*:)`, "g"),
      // CSS custom property in calc() or other functions
      new RegExp(`(?<=\\s|\\(|,)${escapeRegExp(oldToken)}(?=\\s|\\)|,|$)`, "g"),
    ];

    patterns.forEach((pattern) => {
      const beforeReplace = content;
      if (pattern.source.includes("var\\(")) {
        // For var() usage, keep the var() wrapper
        content = content.replace(pattern, `var(${newToken})`);
      } else {
        // For definitions and other contexts, just replace the token
        content = content.replace(pattern, newToken);
      }

      if (content !== beforeReplace) {
        changed = true;
      }
    });
  }

  if (changed) {
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`✅ Updated: ${filePath}`);
    return true;
  }

  return false;
}

/**
 * Escape special regex characters
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Main migration function
 */
function migrateTokens(rootDir = ".") {
  console.log("🚀 Starting CSS Custom Properties migration...\n");

  const files = findFiles(rootDir, FILE_EXTENSIONS);
  console.log(`📁 Found ${files.length} files to process\n`);

  let changedFiles = 0;
  let totalReplacements = 0;

  for (const file of files) {
    const wasChanged = replaceTokensInFile(file, TOKEN_MAPPINGS);
    if (wasChanged) {
      changedFiles++;
    }
  }

  console.log(`\n🎉 Migration complete!`);
  console.log(`📊 Files processed: ${files.length}`);
  console.log(`✏️  Files modified: ${changedFiles}`);
  console.log(
    `📝 Token mappings applied: ${Object.keys(TOKEN_MAPPINGS).length}`
  );
}

// Run the migration if this script is called directly
if (require.main === module) {
  const rootDir = process.argv[2] || ".";
  migrateTokens(rootDir);
}

module.exports = { migrateTokens, TOKEN_MAPPINGS };
