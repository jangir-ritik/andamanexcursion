#!/usr/bin/env node

/**
 * Type Definition Generator (Simplified)
 *
 * This script generates TypeScript type definition files for components that are missing them.
 * Now only generates types when actually needed (components that have props).
 */

import fs from "fs";
import path from "path";

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

// Check if component actually needs types (has props)
const componentNeedsTypes = (componentPath) => {
  const content = fs.readFileSync(componentPath, "utf8");

  // Skip if already has types defined
  if (
    content.includes("Props") ||
    content.includes("interface") ||
    content.includes("type ")
  ) {
    return false;
  }

  // Only generate if component actually uses props
  const usesProps =
    content.includes("props") ||
    content.match(/\(\s*\{\s*\w+/) || // destructured props
    content.includes("FC<") ||
    content.includes("FunctionComponent<");

  return usesProps;
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

// Generate smarter type definitions based on component analysis
const generateTypeDefinition = (componentName, componentPath) => {
  const content = fs.readFileSync(componentPath, "utf8");

  // Basic props that most components need
  let propsContent = `import { ReactNode } from "react";

export interface ${componentName}Props {
  className?: string;`;

  // Analyze component to suggest common props
  if (content.includes("children")) {
    propsContent += `
  children?: ReactNode;`;
  }

  // Check for common prop patterns
  if (content.includes("onClick") || content.includes("onSubmit")) {
    propsContent += `
  onClick?: () => void;`;
  }

  if (content.includes("disabled")) {
    propsContent += `
  disabled?: boolean;`;
  }

  if (content.includes("title") && !content.includes("children")) {
    propsContent += `
  title?: string;`;
  }

  if (content.includes("href")) {
    propsContent += `
  href?: string;`;
  }

  propsContent += `
}
`;

  return propsContent;
};

// Main function to generate type definitions
const generateTypeDefinitions = () => {
  let generatedCount = 0;
  let skippedCount = 0;

  // Process each component type
  for (const [componentType, typeDir] of Object.entries(COMPONENT_TYPES)) {
    const componentsDir = path.join(COMPONENTS_DIR, componentType);

    // Skip if the component type directory doesn't exist
    if (!fs.existsSync(componentsDir)) {
      console.log(`Skipping ${componentType} - directory not found`);
      continue;
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
      componentDirs = pageDirs;
    }

    // Generate type definitions for components that need them
    for (const componentDir of componentDirs) {
      const componentName = getComponentName(componentDir);
      const componentPath = path.join(componentDir, `${componentName}.tsx`);

      // Skip if component file doesn't exist
      if (!fs.existsSync(componentPath)) {
        continue;
      }

      // Skip if component doesn't need types
      if (!componentNeedsTypes(componentPath)) {
        skippedCount++;
        continue;
      }

      // Skip if type definition already exists
      if (hasTypeDefinition(componentName, typeDir)) {
        continue;
      }

      try {
        // Ensure the type directory exists
        if (!fs.existsSync(typeDir)) {
          fs.mkdirSync(typeDir, { recursive: true });
          console.log(`Created directory ${typeDir}`);
        }

        const typeContent = generateTypeDefinition(
          componentName,
          componentPath
        );
        const typeName =
          componentName.charAt(0).toLowerCase() + componentName.slice(1);
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

  console.log(`\n✅ Generated ${generatedCount} type definition files`);
  if (skippedCount > 0) {
    console.log(
      `💡 Skipped ${skippedCount} components that don't need types (no props)`
    );
  }
};

// Run the script
generateTypeDefinitions();
