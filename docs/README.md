# Andaman Excursion Documentation

This directory contains documentation for the Andaman Excursion project. It includes guidelines, standards, and best practices for developing and maintaining the codebase.

## Available Documentation

- [Component Checklist](./COMPONENT_CHECKLIST.md) - A comprehensive checklist for developing components
- [Design System](./DESIGN_SYSTEM.md) - Documentation of the project's design system

## Enforcing Standards

We use several tools to enforce our coding standards:

1. **Component Checker** - A pre-commit hook that validates components against our checklist

   - Run manually: `npm run check-components`
   - Set up Git hooks: `npm run setup-hooks`

2. **ESLint** - For JavaScript/TypeScript linting
   - Run: `npm run lint`

## Development Workflow

When creating new components:

1. Use the component generator: `npm run gen YourComponentName`
2. Follow the [Component Checklist](./COMPONENT_CHECKLIST.md)
3. Adhere to the [Design System](./DESIGN_SYSTEM.md)
4. Run `npm run check-components` before committing

## Directory Structure

The project follows atomic design principles:

- `atoms` - Basic building blocks (buttons, inputs, etc.)
- `molecules` - Combinations of atoms (cards, form fields, etc.)
- `organisms` - Complex UI components (forms, headers, etc.)
- `sectionBlocks` - Page-specific sections

## Content Management

For complex components, we separate content from presentation:

- Component logic goes in `ComponentName.tsx`
- Component styles go in `ComponentName.module.css`
- Component content goes in `ComponentName.content.ts`

This separation allows for easier content updates and maintenance.
