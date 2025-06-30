# Andaman Excursion Development Guide

This guide serves as the central reference for developing components in the Andaman Excursion project. It combines our component checklist, design system guidelines, and development workflow.

## Table of Contents

1. [Component Structure](#component-structure)
2. [Design System](#design-system)
3. [Development Workflow](#development-workflow)
4. [Component Checklist](#component-checklist)
5. [Content Management Strategy](#content-management-strategy)
6. [Tools and Scripts](#tools-and-scripts)

## Component Structure

We follow the atomic design methodology with these component types:

- **Atoms**: Basic building blocks (Button, Input, etc.)
- **Molecules**: Combinations of atoms (Cards, Form fields, etc.)
- **Organisms**: Complex UI components (Forms, Headers, etc.)
- **Layout**: Structural components (Container, Section, etc.)
- **Section Blocks**: Page-specific sections

Each component should follow this structure:

```
ComponentName/
  ├── index.ts            # Re-exports the component
  ├── ComponentName.tsx   # Component implementation
  ├── ComponentName.module.css  # Styles
  └── README.md           # (Optional) Documentation
```

For section blocks and organisms, we also include:

```
ComponentName/
  └── ComponentName.content.ts  # Content separation for CMS readiness
```

## Design System

### Colors

We use CSS variables for all colors:

- **Primary**: `var(--color-primary)`, `var(--color-primary-light)`, `var(--color-primary-dark)`
- **Secondary**: `var(--color-secondary)`, `var(--color-secondary-light)`, `var(--color-secondary-dark)`
- **Text**: `var(--color-text-primary)`, `var(--color-text-secondary)`
- **Background**: `var(--color-background)`, `var(--color-foreground-light)`, `var(--color-foreground-lighter)`
- **Utility**: `var(--color-white)`, `var(--color-black)`, `var(--color-border)`

### Typography

Font families:

- **Primary**: `var(--font-family-jakarta)` (Plus Jakarta Sans)
- **Secondary**: `var(--font-family-quickbeach)` (Quick Beach)

Font sizes:

- `var(--font-size-xs)`: Extra small text
- `var(--font-size-sm)`: Small text
- `var(--font-size-md)`: Medium text
- `var(--font-size-lg)`: Large text
- `var(--font-size-xl)`: Extra large text
- `var(--font-size-2xl)`: 2X large text
- `var(--font-size-3xl)`: 3X large text
- `var(--font-size-4xl)`: 4X large text
- `var(--font-size-5xl)`: 5X large text
- `var(--font-size-button)`: Button text

### Spacing

We use consistent spacing variables:

- `var(--margin-half)`, `var(--margin-1)`, `var(--margin-2)`, etc.
- `var(--padding-half)`, `var(--padding-1)`, `var(--padding-2)`, etc.
- `var(--gap-1)`, `var(--gap-2)`, `var(--gap-3)`, etc.

### Border Radius

- `var(--border-radius-sm)`: Small radius
- `var(--border-radius-md)`: Medium radius
- `var(--border-radius-lg)`: Large radius
- `var(--border-radius-xl)`: Extra large radius
- `var(--border-radius-full)`: Circular radius (50%)

## Development Workflow

### Creating New Components

1. Generate the component scaffold:

   ```bash
   npm run gen -- YourComponentName
   ```

2. Implement the component following the checklist

3. Check your component:

   ```bash
   npm run check-component -- src/components/path/to/YourComponent
   ```

4. Fix any issues and run the check again

### Pre-commit Workflow

Before committing changes:

1. Run `npm run check-components` to check staged components
2. Fix any issues reported by the checker
3. If needed, run `npm run fix-components` to generate missing files

## Component Checklist

### Structure

- [ ] Component follows atomic design principles
- [ ] Component is placed in the appropriate directory
- [ ] Component has a clear, descriptive name
- [ ] Component has an index.ts file
- [ ] Component has proper TypeScript types
- [ ] Complex components have content extracted to separate files

### Styling

- [ ] Uses CSS modules
- [ ] Uses CSS variables for colors, spacing, typography
- [ ] No hardcoded values
- [ ] Responsive design with media queries
- [ ] Follows naming conventions

### Accessibility

- [ ] Uses semantic HTML
- [ ] Includes ARIA attributes where necessary
- [ ] Images have alt text
- [ ] Proper heading hierarchy
- [ ] Meets WCAG AA standards
- [ ] Keyboard accessible
- [ ] Visible focus states
- [ ] Decorative elements use aria-hidden

### Performance

- [ ] Uses Next.js Image component
- [ ] Optimizes loading strategy
- [ ] Avoids unnecessary re-renders

### Code Quality

- [ ] Props have TypeScript interfaces
- [ ] Props have default values where appropriate
- [ ] No unused variables or imports
- [ ] No console.log statements
- [ ] Follows formatting standards

## Content Management Strategy

We separate content from presentation to prepare for potential CMS integration:

### Why We Separate Content

1. **CMS Readiness**: Makes future CMS integration easier
2. **Content Updates**: Allows content changes without touching component logic
3. **Internationalization**: Facilitates translation and localization
4. **Consistency**: Ensures content structure is standardized

### Content File Structure

Content files follow this pattern:

```typescript
// Example: Banner.content.ts
export const content = {
  title: "Explore",
  subtitle: "Andaman!",
  description: "Uncover pristine beaches...",
  image: heroImage.src,
  imageAlt: "Beautiful Andaman Islands",
};
```

## Tools and Scripts

We provide several tools to help maintain code quality:

- `npm run check-component -- path/to/Component`: Check a single component
- `npm run check-components`: Check staged components
- `npm run check-all-components`: Check all components
- `npm run gen-index`: Generate index.ts files
- `npm run gen-types`: Generate TypeScript definitions
- `npm run fix-components`: Run both gen-index and gen-types
- `npm run fix-and-check`: Fix issues and then check all components
- `npm run setup-hooks`: Set up optional Git hooks

### Component Checker

The component checker validates:

1. File structure (index.ts, CSS modules)
2. TypeScript types
3. Content separation
4. Code quality (no console.logs, hardcoded values)
5. Accessibility attributes
6. Image alt text

Run it with:

```bash
npm run check-component -- src/components/path/to/YourComponent
```
