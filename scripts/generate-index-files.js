#!/usr/bin/env node

/**
 * Index File Generator
 *
 * This script generates index.ts files for components that are missing them.
 */

const fs = require("fs");
const path = require("path");

// Configuration
const COMPONENTS_DIR = path.join("src", "components");
const COMPONENT_TYPES = ["atoms", "molecules", "organisms", "sectionBlocks"];

// Helper function to check if a directory has an index.ts file
const hasIndexFile = (dirPath) => {
  return fs.existsSync(path.join(dirPath, "index.ts"));
};

// Helper function to get the component name from the directory
const getComponentName = (dirPath) => {
  const dirName = path.basename(dirPath);
  return dirName.charAt(0).toUpperCase() + dirName.slice(1);
};

// Helper function to generate index.ts content
const generateIndexContent = (dirPath) => {
  const componentName = getComponentName(dirPath);

  // Check if there's a .tsx file with the same name as the directory
  const tsxPath = path.join(dirPath, `${componentName}.tsx`);
  const tsxExists = fs.existsSync(tsxPath);

  if (tsxExists) {
    // Check if the component is exported as default or named
    const content = fs.readFileSync(tsxPath, "utf8");
    const isDefaultExport =
      content.includes(`export default ${componentName}`) ||
      content.includes(`export default function ${componentName}`);

    if (isDefaultExport) {
      return `export { default as ${componentName} } from './${componentName}';`;
    } else {
      return `export { ${componentName} } from './${componentName}';`;
    }
  }

  // Fallback - just export everything
  return `export * from './${componentName}';`;
};

// Main function to generate index files
const generateIndexFiles = () => {
  let generatedCount = 0;

  // Process each component type
  for (const componentType of COMPONENT_TYPES) {
    const typeDir = path.join(COMPONENTS_DIR, componentType);

    // Skip if the component type directory doesn't exist
    if (!fs.existsSync(typeDir)) {
      console.log(`Skipping ${componentType} - directory not found`);
      continue;
    }

    // Get all subdirectories
    const componentDirs = fs
      .readdirSync(typeDir, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => path.join(typeDir, dirent.name));

    // For sectionBlocks, we need to go one level deeper
    if (componentType === "sectionBlocks") {
      const pageDirs = [];
      for (const componentDir of componentDirs) {
        const subDirs = fs
          .readdirSync(componentDir, { withFileTypes: true })
          .filter((dirent) => dirent.isDirectory())
          .map((dirent) => path.join(componentDir, dirent.name));
        pageDirs.push(...subDirs);
      }
      componentDirs.push(...pageDirs);
    }

    // Generate index files for directories without them
    for (const componentDir of componentDirs) {
      if (!hasIndexFile(componentDir)) {
        try {
          const indexContent = generateIndexContent(componentDir);
          const indexPath = path.join(componentDir, "index.ts");

          fs.writeFileSync(indexPath, indexContent);
          console.log(`✅ Generated index.ts for ${componentDir}`);
          generatedCount++;
        } catch (error) {
          console.error(
            `❌ Error generating index.ts for ${componentDir}:`,
            error.message
          );
        }
      }
    }
  }

  console.log(`\nGenerated ${generatedCount} index.ts files`);
};

// Run the script
generateIndexFiles();
