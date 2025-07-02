# Component Checker System Guide (Simplified)

This guide explains how to use the streamlined component checker system for the Andaman Excursion project. The system now focuses on essential quality checks while being less prescriptive about structure.

## Overview

The simplified component checker helps ensure components follow these core principles:

- **TypeScript safety** for components with props
- **Accessibility** for interactive elements
- **Code quality** (no console.logs, proper image alt text)
- **Helpful suggestions** for maintainability

## Available Scripts

| Script                                         | Description                                           |
| ---------------------------------------------- | ----------------------------------------------------- |
| `npm run check-component -- path/to/Component` | Check a single component                              |
| `npm run check-components`                     | Check components that have been staged for git commit |
| `npm run check-all-components`                 | Check all components in the project                   |
| `npm run gen-types`                            | Generate TypeScript types for components with props   |
| `npm run gen-index`                            | Generate index.ts files (optional)                    |
| `npm run fix-components`                       | Run both gen-types and gen-index                      |

## What Gets Checked

### 🔴 Critical Issues (Will Fail Build)

1. **Missing TypeScript types** - Only for components that actually use props
2. **Console logs** - Should be removed from production code
3. **Missing accessibility** - Interactive elements need ARIA attributes
4. **Missing alt text** - All images must have alt attributes

### 🟡 Suggestions (Won't Fail Build)

1. **Hardcoded colors** - Consider using CSS variables
2. **Large components** - Components over 200 lines could be split
3. **Missing CSS modules** - For components with significant styling
4. **Content extraction** - For components with lots of static content
5. **Missing index files** - For frequently imported components

## How to Use

### During Development

1. **Create a new component** using your existing generator:

   ```bash
   npm run gen -- YourComponentName
   ```

2. **Check your component** after making changes:

   ```bash
   npm run check-component -- src/components/path/to/YourComponent
   ```

3. **Before committing**, check staged components:
   ```bash
   npm run check-components
   ```

### Example Output

```bash
✅ Button looks good!

⚠️  HeroSection has 2 suggestion(s):
  🟡 Consider extracting static content from HeroSection to improve maintainability
  🟡 Consider using CSS modules for HeroSection styles

❌ ContactForm has 1 issue(s) that need fixing:
  🔴 ContactForm has interactive elements but missing accessibility attributes
```

## Component Structure (Flexible)

### Minimal Structure

```
ComponentName/
  └── ComponentName.tsx   # Required
```

### Recommended Structure

```
ComponentName/
  ├── ComponentName.tsx        # Required
  ├── ComponentName.module.css # For styled components
  └── index.ts                 # For cleaner imports (optional)
```

### Complex Components

```
ComponentName/
  ├── ComponentName.tsx
  ├── ComponentName.module.css
  ├── ComponentName.content.ts # For content-heavy components
  ├── index.ts
  └── README.md               # Documentation
```

## TypeScript Types

The system now **only generates types when needed**:

- ✅ Components with props get type definitions
- ✅ Components without props are skipped
- ✅ Existing types are preserved
- ✅ Smart prop detection based on component analysis

Types are placed in:

```
src/types/components/[category]/componentName.ts
```

## Accessibility Guidelines

The checker looks for basic accessibility in interactive components:

```tsx
// ✅ Good
<button aria-label="Close dialog" onClick={handleClose}>
  ×
</button>

<img src="hero.jpg" alt="Beautiful Andaman beach at sunset" />

<input
  type="email"
  aria-label="Email address"
  aria-required="true"
/>

// ❌ Needs improvement
<button onClick={handleClose}>×</button>  // Missing aria-label
<img src="hero.jpg" />                    // Missing alt text
<div onClick={handleClick}>Click me</div> // Use button instead
```

## Content Extraction

The system suggests content extraction for:

- Components with arrays of content objects (menus, FAQs, testimonials)
- Components with multiple long text strings (>30 characters)
- Large components (>150 lines) in organisms/sectionBlocks
- Components with navigation items, features lists, etc.

Example of when to extract:

```tsx
// ❌ Content mixed with component logic
const HeroSection = () => {
  const features = [
    { title: "Beautiful Beaches", description: "Pristine white sand beaches..." },
    { title: "Crystal Clear Waters", description: "Perfect for snorkeling..." },
    // ... many more
  ];

  return (
    // component JSX
  );
};

// ✅ Content extracted
// HeroSection.content.ts
export const heroFeatures = [
  { title: "Beautiful Beaches", description: "Pristine white sand beaches..." },
  // ...
];

// HeroSection.tsx
import { heroFeatures } from './HeroSection.content';
```

## Automated Checks

Git hooks automatically run checks:

- **Pre-commit**: Checks staged components (only critical issues block commits)
- **Optional setup**: Hooks are opt-in during npm install

## Best Practices

1. **Focus on critical issues first** - Fix red items before yellow suggestions
2. **Use semantic HTML** - `<button>`, `<nav>`, `<article>` over `<div>`
3. **Add accessibility gradually** - Start with `aria-label` and `alt` text
4. **Extract content when it makes sense** - Don't force it for simple components
5. **Generate types only when needed** - System is now smarter about this

## Migration from Old System

If you're upgrading from the stricter system:

1. **Replace the files** shown in this guide
2. **Run the new checker**: `npm run check-all-components`
3. **Focus on critical issues first** (red items)
4. **Address suggestions gradually** (yellow items)
5. **Remove unnecessary index files** if desired

The new system is much more forgiving and focuses on what actually matters for code quality and maintainability.
