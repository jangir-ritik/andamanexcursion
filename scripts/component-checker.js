#!/usr/bin/env node

/**
 * Simplified Component Checker
 *
 * This script provides essential accessibility and quality checks for components.
 * Only critical issues will fail the build process.
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

// Main component checking function - simplified to focus on critical issues only
const checkComponent = (filePath) => {
  const content = fs.readFileSync(filePath, "utf8");
  const issues = []; // Critical issues that fail the check
  const componentName = path.basename(filePath, ".tsx");

  // CRITICAL ISSUES (will fail build)

  // 1. Console logs in production code
  if (content.includes("console.log")) {
    issues.push(`Remove console.log statements from ${componentName}`);
  }

  // 2. Basic accessibility for interactive elements
  const hasInteractiveElements = content.match(
    /<(button|input|select|textarea|a\s|form)/
  );
  const hasAccessibility =
    content.includes("aria-") ||
    content.includes("alt=") ||
    content.includes("role=");

  if (hasInteractiveElements && !hasAccessibility) {
    issues.push(
      `${componentName} has interactive elements but missing accessibility attributes`
    );
  }

  // 3. Images without alt text
  if (
    (content.includes("<Image") || content.includes("<img")) &&
    !content.includes("alt=")
  ) {
    issues.push(`Ensure all images in ${componentName} have alt text`);
  }

  return { issues };
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

      // Check for nested components
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

  const { issues } = checkComponent(componentPath);
  const componentName = path.basename(componentPath, ".tsx");

  // Show results
  if (issues.length === 0) {
    console.log(`✅ ${componentName} looks good!`);
    return true;
  }

  // Show critical issues
  if (issues.length > 0) {
    console.log(
      `❌ ${componentName} has ${issues.length} issue(s) that need fixing:`
    );
    issues.forEach((issue) => console.log(`  🔴 ${issue}`));
    return false;
  }

  return true;
};

// Check all components
const checkAllComponents = () => {
  const components = getAllComponents();
  console.log(`Checking ${components.length} components...`);

  let passCount = 0;
  let failCount = 0;

  for (const component of components) {
    const passed = checkSingleComponent(component);
    if (passed) {
      passCount++;
    } else {
      failCount++;
    }
  }

  console.log(`\n✅ ${passCount} components passed`);
  if (failCount > 0) {
    console.log(`❌ ${failCount} components have issues that need fixing`);
    return false;
  }

  return true;
};

// Check staged components
const checkStagedComponents = () => {
  const components = getStagedComponents();
  if (components.length === 0) {
    console.log("No staged components to check.");
    return true;
  }

  console.log(`Checking ${components.length} staged components...`);

  let passCount = 0;
  let failCount = 0;

  for (const component of components) {
    const passed = checkSingleComponent(component);
    if (passed) {
      passCount++;
    } else {
      failCount++;
    }
  }

  console.log(`\n✅ ${passCount} components passed`);
  if (failCount > 0) {
    console.log(`❌ ${failCount} components have issues that need fixing`);
    return false;
  }

  return true;
};

// Main function
const main = () => {
  const args = process.argv.slice(2);

  if (args.includes("--all")) {
    // Check all components
    const passed = checkAllComponents();
    process.exit(passed ? 0 : 1);
  } else if (args.includes("--staged")) {
    // Check staged components
    const passed = checkStagedComponents();
    process.exit(passed ? 0 : 1);
  } else if (args.length > 0) {
    // Check a single component
    const componentPath = args[0];
    const passed = checkSingleComponent(componentPath);
    process.exit(passed ? 0 : 1);
  } else {
    console.log("Please specify a component path or use --all/--staged flags.");
    process.exit(1);
  }
};

// Run the script
main();
