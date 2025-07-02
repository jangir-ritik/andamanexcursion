# Andaman Excursion Documentation

This directory contains documentation for the Andaman Excursion project, providing guidelines, standards, and best practices for developing and maintaining the codebase.

## Available Documentation

- [Component Guide](./COMPONENT_GUIDE.md) - Comprehensive guide to component development and structure
- [Design System](./DESIGN_SYSTEM.md) - Documentation of the project's design system

## Quick Start

For new developers, start with the [Component Guide](./COMPONENT_GUIDE.md), which covers:

- Component structure and organization
- TypeScript type management
- Content separation for CMS readiness
- Best practices and standards

## Tools and Scripts

We provide several tools to help maintain code quality:

- `npm run check-component -- path/to/Component`: Check a single component
- `npm run check-components`: Check staged components
- `npm run check-all-components`: Check all components

## Development Workflow

When creating new components:

1. Create a new component folder following the structure in the Component Guide
2. Adhere to the Design System specifications
3. Run `npm run check-components` before committing

## Directory Structure

The project follows atomic design principles:

- `atoms` - Basic building blocks (buttons, inputs, etc.)
- `molecules` - Combinations of atoms (cards, form fields, etc.)
- `organisms` - Complex UI components (forms, headers, etc.)
- `layout` - Structural components (containers, rows, columns)
- `sectionBlocks` - Page-specific sections

## Content Management

For complex components, we separate content from presentation:

- Component logic goes in `ComponentName.tsx`
- Component styles go in `ComponentName.module.css`
- Component content goes in `ComponentName.content.ts`

This separation allows for easier content updates and maintenance.
