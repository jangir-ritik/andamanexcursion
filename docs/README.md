# Andaman Excursion Documentation

This directory contains documentation for the Andaman Excursion project. It includes guidelines, standards, and best practices for developing and maintaining the codebase.

## Available Documentation

- [Development Guide](./DEVELOPMENT_GUIDE.md) - The main reference for component development (recommended)
- [Component Checklist](./COMPONENT_CHECKLIST.md) - A comprehensive checklist for developing components
- [Design System](./DESIGN_SYSTEM.md) - Documentation of the project's design system
- [Component Checker Guide](./COMPONENT_CHECKER_GUIDE.md) - Guide for using the component checker tools

## Quick Start

For new developers, we recommend starting with the [Development Guide](./DEVELOPMENT_GUIDE.md), which provides a consolidated overview of our component development approach, including:

- Component structure and organization
- Design system guidelines
- Development workflow
- Content management strategy
- Tools and scripts

## Tools and Scripts

We provide several tools to help maintain code quality:

- `npm run check-component -- path/to/Component`: Check a single component
- `npm run check-components`: Check staged components
- `npm run check-all-components`: Check all components
- `npm run gen-index`: Generate index.ts files
- `npm run gen-types`: Generate TypeScript definitions
- `npm run fix-components`: Run both gen-index and gen-types
- `npm run fix-and-check`: Fix issues and then check all components

## Content Management Strategy

We separate content from presentation in section blocks and organisms to prepare for potential CMS integration. This approach:

1. Makes future CMS integration easier
2. Allows content changes without touching component logic
3. Facilitates translation and localization
4. Ensures content structure is standardized

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
