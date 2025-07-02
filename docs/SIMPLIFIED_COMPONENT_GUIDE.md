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
  ├── ComponentName.tsx   # Component with inline types
  └── ComponentName.module.css  # Styles
```

### Complex Components

For content-heavy components (especially section blocks and organisms), we use:

```
ComponentName/
  ├── ComponentName.tsx
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

We use a hybrid approach for TypeScript types:

1. **Inline Types**: For simple components, define types directly in the component file:

   ```tsx
   // Button.tsx
   export interface ButtonProps {
     variant?: "primary" | "secondary";
     // ...other props
   }

   export const Button = ({ variant, ...props }: ButtonProps) => {
     // Component implementation
   };
   ```

2. **External Types**: For complex, shared types that are used across multiple components:

   ```tsx
   // Import from types directory
   import { ComplexType } from "@/types/complexTypes";
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
5. **Use TypeScript**: Define types for component props
6. **Import directly**: Import components directly from their files, not from index files

## Import Examples

```tsx
// Old way (with index files)
import { Button } from "@/components/atoms/Button";

// New way (direct imports)
import { Button } from "@/components/atoms/Button/Button";
```

## Migration Guide

When updating existing components:

1. Keep the atomic design structure
2. Remove unnecessary index.ts files for simple components
3. Consider moving simple types inline
4. Keep content separation for section blocks and content-heavy components
