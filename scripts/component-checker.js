#!/usr/bin/env node

/**
 * Simplified Component Checker
 *
 * This script provides a practical approach for checking components.
 * Focuses on essential quality checks without being overly prescriptive.
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

// Smart content detection - only suggest extraction when it makes sense
const shouldExtractContent = (content, filePath) => {
  // Only for complex components
  if (
    !filePath.includes("/organisms/") &&
    !filePath.includes("/sectionBlocks/")
  ) {
    return false;
  }

  // Look for significant static content patterns
  const contentPatterns = [
    // Arrays of objects with text content
    /const\s+\w+\s*=\s*\[[\s\S]*?\{[\s\S]*?['"`][^'"`]{30,}['"`]/,
    // Objects with title/description properties
    /\{[\s\S]*?(?:title|description|text):\s*['"`][^'"`]{20,}['"`][\s\S]*?\}/,
    // Multiple navigation/menu items
    /(?:menuItems|navItems|links|steps)\s*=\s*\[/,
    // FAQ or testimonial data
    /(?:faq|testimonials|reviews|features)\s*=\s*\[/,
  ];

  const hasSignificantContent = contentPatterns.some((pattern) =>
    content.match(pattern)
  );

  // Also check file size
  const isLargeFile = content.split("\n").length > 150;

  return hasSignificantContent || isLargeFile;
};

// Check for basic TypeScript usage
const hasTypeDefinition = (content) => {
  return (
    content.includes("Props") ||
    content.includes("interface") ||
    content.includes("type ") ||
    !content.includes("props") // No props = no need for types
  );
};

// Main component checking function
const checkComponent = (filePath) => {
  const content = fs.readFileSync(filePath, "utf8");
  const issues = []; // Critical issues that fail the check
  const warnings = []; // Suggestions that don't fail
  const componentName = path.basename(filePath, ".tsx");
  const componentDir = path.dirname(filePath);

  // CRITICAL ISSUES (will fail build)

  // 1. TypeScript types for components with props
  if (!hasTypeDefinition(content)) {
    issues.push(`${componentName} should have TypeScript prop types defined`);
  }

  // 2. Console logs in production code
  if (content.includes("console.log")) {
    issues.push(`Remove console.log statements from ${componentName}`);
  }

  // 3. Basic accessibility for interactive components
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

  // 4. Images without alt text
  if (
    (content.includes("<Image") || content.includes("<img")) &&
    !content.includes("alt=")
  ) {
    issues.push(`Ensure all images in ${componentName} have alt text`);
  }

  // WARNINGS (suggestions that don't fail the build)

  // 1. Hardcoded colors
  const colorRegex = /#[0-9A-Fa-f]{3,6}/g;
  const hardcodedColors = content.match(colorRegex);
  if (hardcodedColors && hardcodedColors.length > 0) {
    warnings.push(
      `Consider using CSS variables instead of hardcoded colors: ${hardcodedColors.join(
        ", "
      )}`
    );
  }

  // 2. Large components
  const lineCount = content.split("\n").length;
  if (lineCount > 200) {
    warnings.push(
      `${componentName} is quite large (${lineCount} lines). Consider breaking it down.`
    );
  }

  // 3. CSS modules suggestion
  const hasInlineStyles =
    content.includes("style={{") || content.includes('className="');
  const hasCSSModule = fs.existsSync(
    path.join(componentDir, `${componentName}.module.css`)
  );
  if (hasInlineStyles && !hasCSSModule && lineCount > 50) {
    warnings.push(`Consider using CSS modules for ${componentName} styles`);
  }

  // 4. Content extraction suggestion
  if (shouldExtractContent(content, filePath)) {
    const contentFile = path.join(componentDir, `${componentName}.content.ts`);
    if (!fs.existsSync(contentFile)) {
      warnings.push(
        `Consider extracting static content from ${componentName} to improve maintainability`
      );
    }
  }

  // 5. Index file suggestion (only for frequently imported components)
  if (
    !fs.existsSync(path.join(componentDir, "index.ts")) &&
    (filePath.includes("/organisms/") || filePath.includes("/layout/"))
  ) {
    warnings.push(
      `Consider adding index.ts for cleaner imports of ${componentName}`
    );
  }

  return { issues, warnings };
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

  const { issues, warnings } = checkComponent(componentPath);
  const componentName = path.basename(componentPath, ".tsx");

  // Show results
  if (issues.length === 0 && warnings.length === 0) {
    console.log(`✅ ${componentName} looks good!`);
    return;
  }

  // Show critical issues
  if (issues.length > 0) {
    console.log(
      `❌ ${componentName} has ${issues.length} issue(s) that need fixing:`
    );
    issues.forEach((issue) => console.log(`  🔴 ${issue}`));
  }

  // Show suggestions
  if (warnings.length > 0) {
    console.log(`⚠️  ${componentName} has ${warnings.length} suggestion(s):`);
    warnings.forEach((warning) => console.log(`  🟡 ${warning}`));
  }

  // Only exit with error for critical issues
  if (issues.length > 0) {
    process.exit(1);
  }
};

// Check all components
const checkAllComponents = () => {
  const components = getAllComponents();
  let failedComponents = 0;
  let totalIssues = 0;
  let totalWarnings = 0;

  console.log(`Checking ${components.length} components...`);

  for (const componentPath of components) {
    const { issues, warnings } = checkComponent(componentPath);
    const componentName = path.basename(componentPath, ".tsx");

    if (issues.length > 0 || warnings.length > 0) {
      if (issues.length > 0) {
        console.log(`❌ ${componentName} has ${issues.length} issue(s):`);
        issues.forEach((issue) => console.log(`  🔴 ${issue}`));
        failedComponents++;
        totalIssues += issues.length;
      }

      if (warnings.length > 0) {
        console.log(
          `⚠️  ${componentName} has ${warnings.length} suggestion(s):`
        );
        warnings.forEach((warning) => console.log(`  🟡 ${warning}`));
        totalWarnings += warnings.length;
      }
      console.log(""); // Empty line for readability
    }
  }

  // Summary
  if (failedComponents === 0) {
    console.log(`✅ All ${components.length} components pass critical checks!`);
    if (totalWarnings > 0) {
      console.log(
        `💡 ${totalWarnings} suggestions to consider for code improvements.`
      );
    }
    return true;
  } else {
    console.log(
      `❌ ${failedComponents} out of ${components.length} components have critical issues (${totalIssues} total)`
    );
    if (totalWarnings > 0) {
      console.log(`💡 Plus ${totalWarnings} suggestions for improvements.`);
    }
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

  console.log(`Checking ${components.length} staged component(s)...`);

  let failedComponents = 0;
  let totalIssues = 0;
  let totalWarnings = 0;

  for (const componentPath of components) {
    const { issues, warnings } = checkComponent(componentPath);
    const componentName = path.basename(componentPath, ".tsx");

    if (issues.length > 0 || warnings.length > 0) {
      if (issues.length > 0) {
        console.log(`❌ ${componentName} has ${issues.length} issue(s):`);
        issues.forEach((issue) => console.log(`  🔴 ${issue}`));
        failedComponents++;
        totalIssues += issues.length;
      }

      if (warnings.length > 0) {
        console.log(
          `⚠️  ${componentName} has ${warnings.length} suggestion(s):`
        );
        warnings.forEach((warning) => console.log(`  🟡 ${warning}`));
        totalWarnings += warnings.length;
      }
    }
  }

  if (failedComponents === 0) {
    console.log(
      `✅ All ${components.length} staged components pass critical checks!`
    );
    if (totalWarnings > 0) {
      console.log(`💡 ${totalWarnings} suggestions to consider.`);
    }
    return true;
  } else {
    console.log(
      `❌ ${failedComponents} out of ${components.length} staged components have critical issues`
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
