# Simplified Component Structure Guide

This guide explains the simplified component structure for the Andaman Excursion project. It maintains the benefits of atomic design while reducing unnecessary files and complexity.

## Component Structure

We follow the atomic design methodology with these component types:

- **Atoms**: Basic building blocks (Button, Input, etc.)
- **Molecules**: Combinations of atoms (Cards, Form fields, etc.)
- **Organisms**: Complex UI components (Forms, Headers, etc.)
- **Layout**: Structural components (Container, Section, etc.)
- **Section Blocks**: Page-specific sections

## Simplified File Structure

### Basic Components

For simple components, we use this structure:

```
ComponentName/
  ├── ComponentName.tsx     # Component implementation
  ├── ComponentName.types.ts # Component type definitions
  └── ComponentName.module.css  # Styles
```

### Complex Components

For content-heavy components (especially section blocks and organisms), we use:

```
ComponentName/
  ├── ComponentName.tsx
  ├── ComponentName.types.ts
  ├── ComponentName.module.css
  └── ComponentName.content.ts  # Content separation for CMS readiness
```

### When to Use Index Files

We've removed index files from most simple components. Index files are only kept for:

1. Components with multiple exports
2. Feature folders where you want to expose a public API
3. Layout components that are frequently imported together

For simple components, import directly from the component file:

```tsx
// Import directly from component file
import { Button } from "@/components/atoms/Button/Button";
```

## TypeScript Types

We use a component-local approach for TypeScript types:

1. **Component-Local Types**: Types are defined in a `.types.ts` file in the component's directory:

   ```tsx
   // Button.types.ts
   export interface ButtonProps {
     variant?: "primary" | "secondary";
     // ...other props
   }
   ```

   ```tsx
   // Button.tsx
   import { ButtonProps } from "./Button.types";

   export const Button = ({ variant, ...props }: ButtonProps) => {
     // Component implementation
   };
   ```

2. **Shared Types**: For types used across multiple components, we keep them in a central types directory:

   ```tsx
   // Import shared types
   import { SharedModel } from "@/types/shared/models";
   ```

## Content Separation

We maintain content separation for CMS readiness, but only for components that have significant content:

- Section blocks
- Content-heavy organisms
- Components with multiple text strings, arrays of items, etc.

Example:

```typescript
// Banner.content.ts
export const content = {
  title: "Explore",
  subtitle: "Andaman!",
  description: "Uncover pristine beaches...",
  // ...more content
};
```

## Component Checker

The component checker has been simplified to focus on critical issues:

1. Console logs in production code
2. Basic accessibility for interactive elements
3. Images without alt text

Run it with:

```bash
npm run check-component -- src/components/path/to/YourComponent
```

## Best Practices

1. **Keep components focused**: Each component should do one thing well
2. **Maintain accessibility**: Use semantic HTML and ARIA attributes
3. **Separate content for CMS readiness**: Extract content for complex components
4. **Use CSS modules**: Keep styles scoped to components
5. **Keep types with components**: Place type definitions in a `.types.ts` file in the component directory
6. **Import directly**: Import components directly from their files, not from index files

## Import Examples

```tsx
// Component import
import { Button } from "@/components/atoms/Button/Button";

// Types import
import { ButtonProps } from "@/components/atoms/Button/Button.types";
```

## Migration Guide

When updating existing components:

1. Keep the atomic design structure
2. Remove unnecessary index.ts files for simple components
3. Consider moving simple types inline
4. Keep content separation for section blocks and content-heavy components
