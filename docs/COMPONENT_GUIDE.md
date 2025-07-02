# Component Guide

This comprehensive guide covers component development for the Andaman Excursion project, including structure, organization, types, and best practices.

## Component Organization

Components follow the Atomic Design methodology:

- **Atoms**: Basic building blocks like buttons, inputs, and icons
- **Molecules**: Groups of atoms that function together (cards, form fields)
- **Organisms**: Complex UI components composed of molecules and atoms
- **Layout**: Components for page structure (containers, rows, columns)
- **SectionBlocks**: Page sections that combine multiple components

## Component Structure

Each component follows this structure:

```
ComponentName/
  ├── ComponentName.tsx       # Component implementation
  ├── ComponentName.module.css # Component styles
  ├── ComponentName.types.ts  # Component type definitions
  └── ComponentName.content.ts # (Optional) Content configuration
```

### Key Features

1. **Co-located Types**: Each component has its own `.types.ts` file in the same directory
2. **Direct Imports**: Components are imported directly from their source files
3. **Content Separation**: Content is separated for CMS readiness

## TypeScript Types

Types are defined in a `.types.ts` file in the component's directory:

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

## Import Examples

```tsx
// Import a component
import { Button } from "@/components/atoms/Button/Button";

// Import types
import { ButtonProps } from "@/components/atoms/Button/Button.types";
```

## Migration Example

### Before: Component with External Types

```tsx
// Component: src/components/atoms/Button/Button.tsx
import { ButtonProps } from "@/types/components/atoms/button";
```

### After: Component with Co-located Types

```tsx
// Component: src/components/atoms/Button/Button.tsx
import { ButtonProps } from "./Button.types";

// Types: src/components/atoms/Button/Button.types.ts
export interface ButtonProps {
  // Type definition
}
```

## Component Checklist

### Structure and Organization

- [ ] Component follows atomic design principles
- [ ] Component is placed in the appropriate directory
- [ ] Component has a clear, descriptive name
- [ ] Component has proper TypeScript types in its directory

### Styling

- [ ] Component uses CSS modules for styling
- [ ] Component uses CSS variables from variables.css
- [ ] No hardcoded values for colors, spacing, or typography
- [ ] Component is responsive with appropriate media queries

### Accessibility

- [ ] Semantic HTML elements are used appropriately
- [ ] ARIA attributes are provided where necessary
- [ ] Images have descriptive alt text
- [ ] Proper heading hierarchy is maintained
- [ ] Color contrast meets WCAG AA standards
- [ ] Interactive elements are keyboard accessible

### Performance

- [ ] Images use Next.js Image component with appropriate sizing
- [ ] Large images use priority loading for above-the-fold content
- [ ] Components avoid unnecessary re-renders

### Code Quality

- [ ] Component props have proper TypeScript interfaces
- [ ] Props have default values where appropriate
- [ ] No unused variables or imports
- [ ] No console.log statements in production code
- [ ] Code follows project's formatting standards

### Reusability

- [ ] Component is designed to be reusable where appropriate
- [ ] Component accepts className prop for external styling
- [ ] Component has appropriate variants for different use cases

## Component Checker

Use the component checker to ensure components follow best practices:

```bash
# Check all components
npm run check-components

# Check a specific component
npm run check-component -- src/components/atoms/Button/Button.tsx
```

The component checker focuses on critical issues like:

- Accessibility for interactive elements
- Alt text for images
- Console logs in production code

## Best Practices

1. **Keep components focused**: Each component should do one thing well
2. **Maintain accessibility**: Use semantic HTML and ARIA attributes
3. **Separate content for CMS readiness**: Extract content for complex components
4. **Use CSS modules**: Keep styles scoped to components
5. **Keep types with components**: Place type definitions in a `.types.ts` file in the component directory
6. **Follow the design system**: Use variables from the design system for consistency
