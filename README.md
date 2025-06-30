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
  types/        # TypeScript type definitions
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

This project follows a comprehensive set of development guidelines to ensure consistency and quality:

- [Component Checklist](./docs/COMPONENT_CHECKLIST.md) - A comprehensive checklist for developing components
- [Design System](./docs/DESIGN_SYSTEM.md) - Documentation of the project's design system

### Creating New Components

Use the component generator to create new components:

```bash
npm run gen YourComponentName
```

### Component Structure

Components should follow this structure:

- `ComponentName.tsx` - Component logic
- `ComponentName.module.css` - Component styles
- `index.ts` - Clean exports
- `ComponentName.content.ts` - (For complex components) Content separation

### Code Quality Tools

We use several tools to maintain code quality:

1. **Component Checker** - Validates components against our checklist

   ```bash
   npm run check-components
   ```

2. **Git Hooks** - Automatically check components before committing

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
