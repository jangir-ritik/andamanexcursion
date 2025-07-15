#!/usr/bin/env node

/**
 * Standardize Imports and Exports
 *
 * This script updates all component files to use consistent import and export patterns:
 * 1. Changes all type imports to use 'import type' syntax
 * 2. Converts default exports to named exports
 * 3. Updates index files to use consistent export patterns
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

// Helper function to check if a file is a component
const isComponent = (filePath) => {
  return filePath.endsWith(".tsx") && !filePath.endsWith("index.tsx");
};

// Helper function to check if a file is a type definition
const isTypeDefinition = (filePath) => {
  return filePath.endsWith(".types.ts");
};

// Helper function to check if a file is an index file
const isIndexFile = (filePath) => {
  return filePath.endsWith("index.ts");
};

// Helper function to get the component name from the file path
const getComponentName = (filePath) => {
  const fileName = path.basename(filePath, path.extname(filePath));
  return fileName;
};

// Helper function to standardize imports in a component file
const standardizeImports = (filePath) => {
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, "utf8");
  const componentName = getComponentName(filePath);
  const typeFile = `${componentName}.types`;

  // Replace import { Type } from "./file" with import type { Type } from "./file"
  content = content.replace(
    new RegExp(
      `import\\s+\\{\\s*([\\w\\s,]+)\\s*\\}\\s+from\\s+["']\\.\\/([\\w\\.\\-]+)types["']`,
      "g"
    ),
    'import type { $1 } from "./$2types"'
  );

  // Fix the "export const Component;" syntax error
  if (content.includes(`export const ${componentName};`)) {
    // Check if there's a function declaration for this component
    if (content.includes(`function ${componentName}`)) {
      // Replace function declaration with export const
      content = content.replace(
        new RegExp(
          `function\\s+${componentName}\\s*\\(([^)]+)\\)(?:\\s*:\\s*${componentName}Props)?\\s*(?:=\\s*\\{)?\\s*\\{`,
          "g"
        ),
        `export const ${componentName} = ($1) => {`
      );

      // Remove the standalone export declaration
      content = content.replace(`export const ${componentName};`, "");
    }
  }

  // Convert default exports to named exports
  if (
    content.includes(`export default ${componentName}`) ||
    content.includes(`export default function ${componentName}`)
  ) {
    content = content
      .replace(
        `export default ${componentName}`,
        `export const ${componentName}`
      )
      .replace(
        `export default function ${componentName}`,
        `export function ${componentName}`
      );
  }

  // Fix function component declarations
  content = content.replace(
    new RegExp(
      `function\\s+${componentName}\\s*\\(([^)]+)\\)\\s*:\\s*${componentName}Props`,
      "g"
    ),
    `export const ${componentName} = ($1): ${componentName}Props`
  );

  fs.writeFileSync(filePath, content);
};

// Helper function to standardize index files
const standardizeIndexFile = (filePath, componentName) => {
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, "utf8");

  // Replace export { default } or export { default as X } with export * from
  if (
    content.includes(`export { default `) ||
    content.includes(`export { default as ${componentName} }`)
  ) {
    content = content.replace(
      new RegExp(
        `export\\s+\\{\\s*default(?:\\s+as\\s+${componentName})?\\s*\\}\\s+from\\s+["']\\.\\/${componentName}["']`,
        "g"
      ),
      `export * from "./${componentName}"`
    );
    fs.writeFileSync(filePath, content);
  }
};

// Process all component files
const processComponentFiles = () => {
  for (const componentType of COMPONENT_TYPES) {
    const typeDir = path.join(COMPONENTS_DIR, componentType);
    if (!fs.existsSync(typeDir)) continue;

    // Get all component directories
    const componentDirs = fs
      .readdirSync(typeDir, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => path.join(typeDir, dirent.name));

    for (const componentDir of componentDirs) {
      // Process files in the component directory
      const files = fs.readdirSync(componentDir);

      for (const file of files) {
        const filePath = path.join(componentDir, file);

        if (isComponent(file)) {
          console.log(`Standardizing imports in ${filePath}`);
          standardizeImports(filePath);

          // Update the index file if it exists
          const componentName = getComponentName(file);
          const indexPath = path.join(componentDir, "index.ts");
          if (fs.existsSync(indexPath)) {
            console.log(`Standardizing index file ${indexPath}`);
            standardizeIndexFile(indexPath, componentName);
          }
        }
      }

      // Handle nested components (for sectionBlocks)
      const nestedDirs = fs
        .readdirSync(componentDir, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => path.join(componentDir, dirent.name));

      for (const nestedDir of nestedDirs) {
        const nestedFiles = fs.readdirSync(nestedDir);

        for (const file of nestedFiles) {
          const filePath = path.join(nestedDir, file);

          if (isComponent(file)) {
            console.log(
              `Standardizing imports in nested component ${filePath}`
            );
            standardizeImports(filePath);

            // Update the index file if it exists
            const componentName = getComponentName(file);
            const indexPath = path.join(nestedDir, "index.ts");
            if (fs.existsSync(indexPath)) {
              console.log(`Standardizing index file ${indexPath}`);
              standardizeIndexFile(indexPath, componentName);
            }
          }
        }
      }
    }
  }
};

// Run the script
console.log("Standardizing imports and exports across all component files...");
processComponentFiles();
console.log("Done!");
