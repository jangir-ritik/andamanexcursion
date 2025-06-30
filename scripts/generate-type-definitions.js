#!/usr/bin/env node

/**
 * Type Definition Generator
 *
 * This script generates TypeScript type definition files for components that are missing them.
 */

const fs = require("fs");
const path = require("path");

// Configuration
const COMPONENTS_DIR = path.join("src", "components");
const TYPES_DIR = path.join("src", "types", "components");
const COMPONENT_TYPES = {
  atoms: path.join(TYPES_DIR, "atoms"),
  molecules: path.join(TYPES_DIR, "molecules"),
  organisms: path.join(TYPES_DIR, "organisms"),
  layout: path.join(TYPES_DIR, "layout"),
  sectionBlocks: path.join(TYPES_DIR, "sectionBlocks"),
};

// Helper function to check if a type definition file exists
const hasTypeDefinition = (componentName, typeDir) => {
  const fileName = `${
    componentName.charAt(0).toLowerCase() + componentName.slice(1)
  }.ts`;
  return fs.existsSync(path.join(typeDir, fileName));
};

// Helper function to get the component name from the directory
const getComponentName = (dirPath) => {
  const dirName = path.basename(dirPath);
  return dirName.charAt(0).toUpperCase() + dirName.slice(1);
};

// Helper function to generate basic type definition content
const generateTypeDefinition = (componentName) => {
  return `import { ReactNode } from "react";

export interface ${componentName}Props {
  className?: string;
  children?: ReactNode;
}
`;
};

// Main function to generate type definitions
const generateTypeDefinitions = () => {
  let generatedCount = 0;

  // Process each component type
  for (const [componentType, typeDir] of Object.entries(COMPONENT_TYPES)) {
    const componentsDir = path.join(
      COMPONENTS_DIR,
      componentType === "layout"
        ? "layout"
        : componentType === "sectionBlocks"
        ? "sectionBlocks"
        : componentType
    );

    // Skip if the component type directory doesn't exist
    if (!fs.existsSync(componentsDir)) {
      console.log(`Skipping ${componentType} - directory not found`);
      continue;
    }

    // Ensure the type directory exists
    if (!fs.existsSync(typeDir)) {
      fs.mkdirSync(typeDir, { recursive: true });
      console.log(`Created directory ${typeDir}`);
    }

    // Get all component directories
    let componentDirs = fs
      .readdirSync(componentsDir, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => path.join(componentsDir, dirent.name));

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
      componentDirs = pageDirs; // Replace with the deeper level directories
    }

    // Generate type definitions for components without them
    for (const componentDir of componentDirs) {
      const componentName = getComponentName(componentDir);
      const typeName =
        componentName.charAt(0).toLowerCase() + componentName.slice(1);

      if (!hasTypeDefinition(componentName, typeDir)) {
        try {
          const typeContent = generateTypeDefinition(componentName);
          const typePath = path.join(typeDir, `${typeName}.ts`);

          fs.writeFileSync(typePath, typeContent);
          console.log(`✅ Generated type definition for ${componentName}`);
          generatedCount++;

          // Update index.ts in the type directory
          const indexPath = path.join(typeDir, "index.ts");
          const exportStatement = `export * from './${typeName}';\n`;

          if (fs.existsSync(indexPath)) {
            const indexContent = fs.readFileSync(indexPath, "utf8");
            if (!indexContent.includes(exportStatement.trim())) {
              fs.appendFileSync(indexPath, exportStatement);
            }
          } else {
            fs.writeFileSync(indexPath, exportStatement);
          }
        } catch (error) {
          console.error(
            `❌ Error generating type definition for ${componentName}:`,
            error.message
          );
        }
      }
    }
  }

  console.log(`\nGenerated ${generatedCount} type definition files`);
};

// Run the script
generateTypeDefinitions();
