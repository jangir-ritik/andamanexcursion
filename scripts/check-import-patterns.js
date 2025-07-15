#!/usr/bin/env node

/**
 * Check Import Patterns
 *
 * This script checks for consistent import and export patterns across the codebase:
 * 1. All component exports should be named exports
 * 2. All type imports should use 'import type' syntax
 * 3. No default imports for components
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

// Configuration
const COMPONENTS_DIR = path.join("src", "components");
const COMPONENT_TYPES = [
  "atoms",
  "molecules",
  "organisms",
  "layout",
  "sectionBlocks",
];
const APP_DIR = path.join("src", "app");

// Helper function to check if a file is a component
const isComponent = (filePath) => {
  return filePath.endsWith(".tsx") && !filePath.endsWith("index.tsx");
};

// Helper function to check if a file is a type definition
const isTypeDefinition = (filePath) => {
  return filePath.endsWith(".types.ts");
};

// Helper function to get all component files
const getAllComponentFiles = () => {
  const componentFiles = [];

  // Check components directory
  for (const componentType of COMPONENT_TYPES) {
    const typeDir = path.join(COMPONENTS_DIR, componentType);
    if (!fs.existsSync(typeDir)) continue;

    const componentDirs = fs
      .readdirSync(typeDir, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => path.join(typeDir, dirent.name));

    for (const componentDir of componentDirs) {
      const files = fs.readdirSync(componentDir);

      for (const file of files) {
        const filePath = path.join(componentDir, file);
        if (isComponent(file)) {
          componentFiles.push(filePath);
        }
      }

      // Handle nested components (for sectionBlocks)
      const nestedDirs = fs
        .readdirSync(componentDir, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => path.join(componentDir, dirent.name));

      for (const nestedDir of nestedDirs) {
        if (!fs.existsSync(nestedDir)) continue;
        const nestedFiles = fs.readdirSync(nestedDir);

        for (const file of nestedFiles) {
          const filePath = path.join(nestedDir, file);
          if (isComponent(file)) {
            componentFiles.push(filePath);
          }
        }
      }
    }
  }

  // Check app directory
  const appFiles = [];
  const checkAppDir = (dir) => {
    if (!fs.existsSync(dir)) return;

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        checkAppDir(fullPath);
      } else if (entry.name.endsWith(".tsx") && !entry.name.startsWith("_")) {
        appFiles.push(fullPath);
      }
    }
  };

  checkAppDir(APP_DIR);
  componentFiles.push(...appFiles);

  return componentFiles;
};

// Check for default exports in component files
const checkDefaultExports = (filePath) => {
  const content = fs.readFileSync(filePath, "utf8");
  const fileName = path.basename(filePath, path.extname(filePath));

  // Skip Next.js page files - they need default exports
  const normalizedPath = filePath.replace(/\\/g, "/");
  if (
    normalizedPath.includes("src/app") &&
    (normalizedPath.includes("page.tsx") ||
      normalizedPath.includes("layout.tsx"))
  ) {
    // Check for named exports in Next.js pages (which should be avoided)
    if (content.match(/export\s+const\s+[A-Z][a-zA-Z0-9_]*\s*=/)) {
      console.log(
        `⚠️ Next.js page ${filePath} has a named export. Pages should only use default exports.`
      );
    }

    // Check for correct default export format
    if (!content.includes("export default function")) {
      console.log(
        `⚠️ Next.js page ${filePath} should use 'export default function' syntax.`
      );
    }

    return true;
  }

  // Check for default exports
  if (
    content.includes(`export default ${fileName}`) ||
    content.includes("export default function") ||
    content.match(/export\s+default\s+/)
  ) {
    console.log(`❌ Default export found in ${filePath}`);
    return false;
  }

  return true;
};

// Check for type imports without 'import type' syntax
const checkTypeImports = (filePath) => {
  const content = fs.readFileSync(filePath, "utf8");

  // Check for type imports without 'import type'
  const typeImportRegex =
    /import\s+{\s*([^}]+)\s*}\s+from\s+["'].*\.types["']/g;
  const matches = content.match(typeImportRegex);

  if (matches) {
    console.log(`❌ Type import without 'import type' syntax in ${filePath}`);
    return false;
  }

  return true;
};

// Check for default imports of components
const checkDefaultImports = (filePath) => {
  const content = fs.readFileSync(filePath, "utf8");

  // Check for default imports of our components
  const defaultImportRegex =
    /import\s+([A-Z][a-zA-Z0-9_]*)\s+from\s+["']@\/components/g;
  const matches = content.match(defaultImportRegex);

  if (matches) {
    console.log(`❌ Default import of component found in ${filePath}`);
    return false;
  }

  return true;
};

// Main function
const checkImportPatterns = () => {
  console.log("Checking import and export patterns...");

  const componentFiles = getAllComponentFiles();
  let hasErrors = false;

  for (const filePath of componentFiles) {
    const defaultExportCheck = checkDefaultExports(filePath);
    const typeImportCheck = checkTypeImports(filePath);
    const defaultImportCheck = checkDefaultImports(filePath);

    if (!defaultExportCheck || !typeImportCheck || !defaultImportCheck) {
      hasErrors = true;
    }
  }

  if (hasErrors) {
    console.log(
      "\n❌ Found issues with import/export patterns. Please fix them to maintain consistency."
    );
    process.exit(1);
  } else {
    console.log("\n✅ All import and export patterns are consistent!");
  }
};

// Run the script
checkImportPatterns();
