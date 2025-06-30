# Component Fixes Plan

This document outlines a plan to address the issues identified by the component checker. The issues are categorized by priority to help focus efforts efficiently.

## High Priority Issues

### Missing TypeScript Type Definitions

These are important for code quality, developer experience, and type safety:

1. **Create a types directory structure for section blocks:**

   ```
   src/types/components/sectionBlocks/
   ├── andamanCalling.ts
   ├── banner.ts
   ├── faq.ts
   ├── hiddenGems.ts
   ├── index.ts (to export all types)
   ├── packageCarousel.ts
   ├── packages.ts
   ├── partners.ts
   ├── scubaDiving.ts
   ├── story.ts
   ├── testimonials.ts
   ├── trustStats.ts
   └── whyChooseUs.ts
   ```

2. **Create type definitions for molecules:**
   ```
   src/types/components/molecules/
   ├── testimonialCard.ts
   ```

### Hardcoded Values

Replace any remaining hardcoded values with CSS variables:

- Check for hardcoded colors, spacing, border-radius values, etc.

## Medium Priority Issues

### Missing index.ts Files

Create index.ts files for components to enable cleaner imports:

```
src/components/sectionBlocks/homepage/
├── andamanCalling/index.ts
├── banner/index.ts
├── hiddenGems/index.ts
├── packageCarousel/index.ts
├── packages/index.ts
├── partners/index.ts
├── scubaDiving/index.ts
├── story/index.ts
```

### ARIA Attributes

Improve accessibility by adding appropriate ARIA attributes:

1. **HeroTitle:** Add appropriate ARIA attributes
2. **ImageContainer:** Add appropriate ARIA attributes

## Implementation Strategy

To efficiently address these issues:

1. **Batch similar tasks together:**

   - Create all type definitions in one session
   - Create all index.ts files in another session
   - Address accessibility issues in a dedicated session

2. **Use templates:**

   - Create a standard template for type definitions
   - Create a standard template for index.ts files

3. **Automate where possible:**

   - Consider writing a script to generate basic index.ts files
   - Consider writing a script to generate basic type definition files

4. **Prioritize by impact:**
   - Focus first on components used most frequently
   - Address issues in the most visible components first

## Validation

After implementing fixes:

1. Run the component checker to verify issues are resolved
2. Manually review key components to ensure quality
3. Test the application to ensure no regressions
