# Component Checker System Guide

This guide explains how to use the component checker system to maintain code quality and consistency across the Andaman Excursion project.

## Overview

The component checker system helps ensure that all components follow the established guidelines and best practices. It checks for:

- Proper file structure
- Consistent naming conventions
- Required exports and imports
- TypeScript type definitions
- Accessibility features
- CSS module usage
- Documentation

## Available Scripts

The following npm scripts are available for component checking:

| Script                                         | Description                                           |
| ---------------------------------------------- | ----------------------------------------------------- |
| `npm run check-component -- path/to/Component` | Check a single component                              |
| `npm run check-components`                     | Check components that have been staged for git commit |
| `npm run check-all-components`                 | Check all components in the project                   |
| `npm run gen-index`                            | Generate index.ts files for all components            |
| `npm run gen-types`                            | Generate TypeScript type definition files             |
| `npm run fix-components`                       | Run both gen-index and gen-types                      |

## How to Use

### During Development

1. When creating a new component:

   ```bash
   npm run gen -- YourComponentName
   ```

   This will scaffold a new component using the Hygen template.

2. After making changes to a component, check it:

   ```bash
   npm run check-component -- src/components/path/to/YourComponent
   ```

3. Before committing, run:
   ```bash
   npm run check-components
   ```
   This will automatically check all staged components.

### Automated Checks

The system includes Git hooks that automatically run checks:

- **Pre-commit**: Checks staged components before allowing a commit
- **Post-install**: Sets up Git hooks when running `npm install`

## Component Structure Requirements

Components should follow this structure:

```
ComponentName/
  ├── index.ts            # Re-exports the component
  ├── ComponentName.tsx   # Component implementation
  ├── ComponentName.module.css  # Styles
  └── README.md           # (Optional) Documentation
```

## Type Definitions

Type definitions should be placed in:

```
src/types/components/[category]/componentName.ts
```

Where `[category]` is one of: atoms, molecules, organisms, layout, or sectionBlocks.

## Fixing Common Issues

### Missing Index Files

```bash
npm run gen-index
```

### Missing Type Definitions

```bash
npm run gen-types
```

### Both Issues

```bash
npm run fix-components
```

## Best Practices

1. Always run component checks before committing changes
2. Keep component files small and focused on a single responsibility
3. Ensure proper accessibility attributes are included
4. Use CSS variables from the design system instead of hardcoded values
5. Document complex components with README.md files

## Troubleshooting

If you encounter issues with the checker system:

1. Make sure all required files exist for your component
2. Check that exports are properly set up in index.ts files
3. Verify that type definitions match component props
4. Ensure component names match their file names
