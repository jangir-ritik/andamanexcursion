# Component Structure Guide

This document outlines the component structure used in the Andaman Excursion project.

## Component Organization

Components are organized following the Atomic Design methodology:

- **Atoms**: Basic building blocks like buttons, inputs, and icons
- **Molecules**: Groups of atoms that function together (cards, form fields)
- **Organisms**: Complex UI components composed of molecules and atoms
- **Layout**: Components for page structure (containers, grids)
- **SectionBlocks**: Page sections that combine multiple components

## Component Structure

Each component follows a consistent structure:

```
ComponentName/
  ├── ComponentName.tsx       # Component implementation
  ├── ComponentName.module.css # Component styles
  ├── ComponentName.types.ts  # Component type definitions
  ├── ComponentName.content.ts # (Optional) Content configuration
  └── index.ts                # Exports component and types
```

### Key Features

1. **Co-located Types**: Each component has its own `.types.ts` file in the same directory
2. **Direct Imports**: Components are imported directly from their source files
3. **Simplified Index Files**: Index files export both the component and its types

## Import Examples

```tsx
// Import a component
import { Button } from "@/components/atoms/Button/Button";

// Import types
import { ButtonProps } from "@/components/atoms/Button/Button.types";

// Import from index (exports both component and types)
import { Button, ButtonProps } from "@/components/atoms/Button";
```

## Content Separation

For components that display content, we separate the content into a `.content.ts` file:

```tsx
// ComponentName.content.ts
export const componentContent = {
  title: "Example Title",
  description: "Example description",
};

// ComponentName.tsx
import { componentContent } from "./ComponentName.content";
```

This separation facilitates future CMS integration.

## Component Checker

Use the component checker to ensure components follow best practices:

```bash
# Check all components
npm run check-components

# Check a specific component
npm run check-components -- src/components/atoms/Button/Button.tsx
```

The component checker focuses on critical issues like:

- Accessibility for interactive elements
- Alt text for images
- Console logs in production code
