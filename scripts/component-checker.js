#!/usr/bin/env node

/**
 * Unified Component Checker
 *
 * This script provides a unified interface for checking components against the project's
 * component checklist. It can check:
 * - A single component (when a path is provided)
 * - All staged components (when --staged flag is used)
 * - All components in the project (when --all flag is used)
 *
 * Usage:
 * - node component-checker.js path/to/Component      # Check a single component
 * - node component-checker.js --staged               # Check staged components
 * - node component-checker.js --all                  # Check all components
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Configuration
const COMPONENTS_DIR = path.join("src", "components");
const COMPONENT_TYPES = [
  "atoms",
  "molecules",
  "organisms",
  "layout",
  "sectionBlocks",
];

// Check if a file is a component
const isComponent = (filePath) => {
  return filePath.endsWith(".tsx") && !filePath.endsWith("index.tsx");
};

// Check if a type definition exists for a component
const hasTypeDefinition = (componentName, componentDir, componentContent) => {
  // First, check if the component imports a Props type
  const importRegex = /import.*\{.*Props.*\}.*from/;
  if (importRegex.test(componentContent)) {
    return true;
  }

  // Extract the component type (atoms, molecules, organisms, etc.)
  const match = componentDir.match(/\/components\/([^/]+)/);
  if (!match) return false;

  const componentType = match[1];
  const typesDir = path.join("src", "types", "components", componentType);

  // Check for direct type file
  const typeFile = path.join(typesDir, `${componentName.toLowerCase()}.ts`);
  if (fs.existsSync(typeFile)) return true;

  // For cards, check if they're in a consolidated file
  if (componentDir.includes("/Cards/")) {
    const cardsTypeFile = path.join(typesDir, "cards.ts");
    if (fs.existsSync(cardsTypeFile)) {
      const content = fs.readFileSync(cardsTypeFile, "utf8");
      return content.includes(`${componentName}Props`);
    }
  }

  // Check for other consolidated files
  const consolidatedFiles = ["index.ts", "common.ts"];
  for (const file of consolidatedFiles) {
    const consolidatedFile = path.join(typesDir, file);
    if (fs.existsSync(consolidatedFile)) {
      const content = fs.readFileSync(consolidatedFile, "utf8");
      if (content.includes(`${componentName}Props`)) return true;
    }
  }

  return false;
};

// Basic checks for components
const checkComponent = (filePath) => {
  const content = fs.readFileSync(filePath, "utf8");
  const issues = [];

  // Check for structure issues
  const componentName = path.basename(filePath, ".tsx");
  const componentDir = path.dirname(filePath);

  // Check for index.ts file
  if (!fs.existsSync(path.join(componentDir, "index.ts"))) {
    issues.push(`Missing index.ts file for ${componentName}`);
  }

  // Check for CSS module
  if (!fs.existsSync(path.join(componentDir, `${componentName}.module.css`))) {
    issues.push(`Missing CSS module for ${componentName}`);
  }

  // Check for TypeScript types
  if (!hasTypeDefinition(componentName, componentDir, content)) {
    issues.push(`Missing TypeScript type definition for ${componentName}`);
  }

  // Check for content in separate file for complex components
  if (
    (filePath.includes("/sectionBlocks/") ||
      filePath.includes("/organisms/")) &&
    !fs.existsSync(path.join(componentDir, `${componentName}.content.ts`))
  ) {
    issues.push(
      `Consider extracting content to a separate file for ${componentName}`
    );
  }

  // Check for code quality issues
  if (content.includes("console.log")) {
    issues.push(`Remove console.log statements from ${componentName}`);
  }

  // Check for hardcoded values
  const colorRegex = /#[0-9A-Fa-f]{3,6}/g;
  const hardcodedColors = content.match(colorRegex);
  if (hardcodedColors && hardcodedColors.length > 0) {
    issues.push(
      `Hardcoded colors found in ${componentName}: ${hardcodedColors.join(
        ", "
      )}`
    );
  }

  // Check for accessibility
  if (!content.includes("aria-") && !content.includes("role=")) {
    issues.push(
      `Consider adding ARIA attributes to ${componentName} for better accessibility`
    );
  }

  // Check for image alt text
  if (
    (content.includes("<Image") || content.includes("<img")) &&
    !content.includes("alt=")
  ) {
    issues.push(`Ensure all images in ${componentName} have alt text`);
  }

  return issues;
};

// Get all components in the project
const getAllComponents = () => {
  const components = [];

  for (const type of COMPONENT_TYPES) {
    const typeDir = path.join(COMPONENTS_DIR, type);
    if (!fs.existsSync(typeDir)) continue;

    const componentDirs = fs.readdirSync(typeDir);
    for (const componentDir of componentDirs) {
      const componentPath = path.join(typeDir, componentDir);
      if (!fs.statSync(componentPath).isDirectory()) continue;

      const files = fs.readdirSync(componentPath);
      for (const file of files) {
        if (isComponent(file)) {
          components.push(path.join(componentPath, file));
        }
      }

      // Check for nested components (like Cards/SmallCard)
      const nestedDirs = fs
        .readdirSync(componentPath)
        .filter((dir) =>
          fs.statSync(path.join(componentPath, dir)).isDirectory()
        );

      for (const nestedDir of nestedDirs) {
        const nestedPath = path.join(componentPath, nestedDir);
        const nestedFiles = fs.readdirSync(nestedPath);

        for (const file of nestedFiles) {
          if (isComponent(file)) {
            components.push(path.join(nestedPath, file));
          }
        }
      }
    }
  }

  return components;
};

// Get staged components
const getStagedComponents = () => {
  try {
    const gitOutput = execSync("git diff --cached --name-only").toString();
    const stagedFiles = gitOutput.split("\n").filter(Boolean);
    return stagedFiles.filter(
      (file) => file.startsWith("src/components") && isComponent(file)
    );
  } catch (error) {
    console.error("Error getting staged files:", error.message);
    return [];
  }
};

// Check a single component
const checkSingleComponent = (componentPath) => {
  if (!fs.existsSync(componentPath)) {
    console.error(`Component not found: ${componentPath}`);
    process.exit(1);
  }

  const issues = checkComponent(componentPath);
  const componentName = path.basename(componentPath, ".tsx");

  if (issues.length === 0) {
    console.log(`✅ ${componentName} passes all checks!`);
  } else {
    console.log(`❌ ${componentName} has ${issues.length} issue(s):`);
    issues.forEach((issue) => console.log(`  - ${issue}`));
    process.exit(1);
  }
};

// Check all components
const checkAllComponents = () => {
  const components = getAllComponents();
  let failedComponents = 0;
  let totalIssues = 0;

  console.log(`Checking ${components.length} components...`);

  for (const componentPath of components) {
    const issues = checkComponent(componentPath);
    const componentName = path.basename(componentPath, ".tsx");

    if (issues.length > 0) {
      console.log(`❌ ${componentName} has ${issues.length} issue(s):`);
      issues.forEach((issue) => console.log(`  - ${issue}`));
      failedComponents++;
      totalIssues += issues.length;
    }
  }

  if (failedComponents === 0) {
    console.log(`✅ All ${components.length} components pass the checks!`);
    return true;
  } else {
    console.log(
      `❌ ${failedComponents} out of ${components.length} components have issues (${totalIssues} total issues)`
    );
    return false;
  }
};

// Check staged components
const checkStagedComponents = () => {
  const components = getStagedComponents();

  if (components.length === 0) {
    console.log("No staged components found.");
    return true;
  }

  console.log(`Checking ${components.length} staged components...`);

  let failedComponents = 0;
  let totalIssues = 0;

  for (const componentPath of components) {
    const issues = checkComponent(componentPath);
    const componentName = path.basename(componentPath, ".tsx");

    if (issues.length > 0) {
      console.log(`❌ ${componentName} has ${issues.length} issue(s):`);
      issues.forEach((issue) => console.log(`  - ${issue}`));
      failedComponents++;
      totalIssues += issues.length;
    }
  }

  if (failedComponents === 0) {
    console.log(
      `✅ All ${components.length} staged components pass the checks!`
    );
    return true;
  } else {
    console.log(
      `❌ ${failedComponents} out of ${components.length} staged components have issues (${totalIssues} total issues)`
    );
    return false;
  }
};

// Main function
const main = () => {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(
      "Please provide a component path or use --all or --staged flags"
    );
    console.log("Usage:");
    console.log("  node component-checker.js path/to/Component");
    console.log("  node component-checker.js --staged");
    console.log("  node component-checker.js --all");
    process.exit(1);
  }

  if (args[0] === "--all") {
    const passed = checkAllComponents();
    process.exit(passed ? 0 : 1);
  } else if (args[0] === "--staged") {
    const passed = checkStagedComponents();
    process.exit(passed ? 0 : 1);
  } else {
    checkSingleComponent(args[0]);
  }
};

main();
