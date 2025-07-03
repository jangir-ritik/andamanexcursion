# Andaman Excursion

A Next.js website for Andaman Excursion, a travel company specializing in tours and experiences in the Andaman Islands.

## Project Structure

The project follows atomic design principles:

```
src/
  components/
    atoms/       # Basic building blocks (buttons, inputs, etc.)
    molecules/   # Combinations of atoms (cards, form fields, etc.)
    organisms/   # Complex UI components (forms, headers, etc.)
    layout/      # Layout components (containers, sections, etc.)
    sectionBlocks/ # Page-specific sections
  app/          # Next.js app directory
  styles/       # Global styles and variables
```

## Getting Started

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Development Guidelines

This project follows a simplified set of development guidelines to ensure consistency and quality:

- [Component Structure Guide](./docs/COMPONENT_STRUCTURE.md) - Our approach to component organization
- [Simplified Component Guide](./docs/SIMPLIFIED_COMPONENT_GUIDE.md) - Our streamlined approach to component development
- [Component Migration Example](./docs/COMPONENT_MIGRATION_EXAMPLE.md) - Example of migrating to the simplified structure
- [Component Checklist](./docs/COMPONENT_CHECKLIST.md) - A comprehensive checklist for developing components
- [Design System](./docs/DESIGN_SYSTEM.md) - Documentation of the project's design system

### Creating New Components

Create new components manually following the simplified structure:

```bash
mkdir -p src/components/atoms/YourComponent
touch src/components/atoms/YourComponent/YourComponent.tsx
touch src/components/atoms/YourComponent/YourComponent.module.css
touch src/components/atoms/YourComponent/YourComponent.types.ts
```

### Component Structure

Components follow a simplified structure:

- **Basic Components**:

  - `ComponentName.tsx` - Component logic
  - `ComponentName.module.css` - Component styles
  - `ComponentName.types.ts` - Component type definitions

- **Complex Components**:
  - `ComponentName.tsx` - Component logic
  - `ComponentName.module.css` - Component styles
  - `ComponentName.types.ts` - Component type definitions
  - `ComponentName.content.ts` - Content separation (for CMS readiness)

### Importing Components

Import components directly from their files using named imports:

```tsx
// Direct import (preferred)
import { Button } from "@/components/atoms/Button/Button";
import type { ButtonProps } from "@/components/atoms/Button/Button.types";

// Or import from index
import { Button } from "@/components/atoms/Button";
```

All components use named exports and the `import type` syntax for importing types. Never use default exports or imports for components.

### Export Patterns

For regular components, always use named exports:

```tsx
// ✅ DO this for regular components
export const ComponentName = () => { ... };

// ❌ DON'T do this for regular components
export default ComponentName;
```

For Next.js pages, use default exports with function declarations:

```tsx
// ✅ DO this for Next.js pages (in src/app)
export default function PageName() { ... }

// ❌ DON'T do this for Next.js pages
export const PageName = () => { ... };
export default PageName;
```

This ensures consistency across the codebase and prevents import errors.

### Code Quality Tools

We use several tools to maintain code quality:

1. **Component Checker** - Validates critical aspects of components

   ```bash
   npm run check-components
   ```

2. **Git Hooks** - Optionally check components before committing

   ```bash
   npm run setup-hooks
   ```

3. **ESLint** - For JavaScript/TypeScript linting
   ```bash
   npm run lint
   ```

## Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [CSS Modules](https://github.com/css-modules/css-modules)

## Project Documentation

For more detailed information about the project, check the [docs](./docs) directory.
