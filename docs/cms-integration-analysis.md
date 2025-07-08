# Andaman Excursion CMS Integration Analysis

This document provides a comprehensive analysis of the Andaman Excursion codebase structure to facilitate CMS integration, with a focus on content files, endpoint pages, and icon usage throughout the application.

## Content Files Structure

### Page Content Files (9 files)

1. `src/app/page.content.ts` - Homepage
2. `src/app/ferry/page.content.ts` - Ferry page
3. `src/app/fishing/page.content.ts` - Fishing page
4. `src/app/packages/page.content.ts` - Packages page
5. `src/app/activities/page.content.ts` - Activities page
6. `src/app/destinations/page.content.ts` - Destinations page
7. `src/app/live-volcanos/page.content.ts` - Live Volcanos page
8. `src/app/specials/[event]/page.content.ts` - Dynamic event page
9. `src/app/destinations/[name]/page.content.ts` - Dynamic destination page

### SectionBlock Content Files (60+ files)

These are organized into categories:

1. **Common SectionBlocks** (reused across pages):

   - `src/components/sectionBlocks/common/faq/FAQ.content.ts`
   - `src/components/sectionBlocks/common/testimonials/Testimonials.content.ts`
   - `src/components/sectionBlocks/common/partners/Partners.content.ts`
   - `src/components/sectionBlocks/common/largeCardSection/LargeCardSection.content.ts`
   - `src/components/sectionBlocks/common/trivia/Trivia.content.ts`

2. **Homepage SectionBlocks**:

   - `src/components/sectionBlocks/homepage/banner/Banner.content.ts`
   - `src/components/sectionBlocks/homepage/hiddenGems/HiddenGems.content.ts`
   - `src/components/sectionBlocks/homepage/packages/Packages.content.ts`
   - `src/components/sectionBlocks/homepage/story/Story.content.ts`
   - `src/components/sectionBlocks/homepage/trustStats/TrustStats.content.ts`
   - `src/components/sectionBlocks/homepage/whyChooseUs/WhyChooseUs.content.ts`

3. **Ferry SectionBlocks**:
   - `src/components/sectionBlocks/ferry/trivia/Trivia.content.ts`
   - And others

### Endpoint Pages (46 files)

1. **Main pages**:

   - `src/app/page.tsx` - Homepage
   - `src/app/ferry/page.tsx` - Ferry page
   - `src/app/fishing/page.tsx` - Fishing page
   - `src/app/packages/page.tsx` - Packages page
   - `src/app/activities/page.tsx` - Activities page
   - `src/app/destinations/page.tsx` - Destinations page
   - `src/app/live-volcanos/page.tsx` - Live Volcanos page
   - `src/app/specials/page.tsx` - Specials page

2. **Dynamic pages**:

   - `src/app/specials/[event]/page.tsx` - Dynamic event pages
   - `src/app/destinations/[name]/page.tsx` - Dynamic destination pages
   - `src/app/packages/[category]/[id]/page.tsx` - Dynamic package detail pages

3. **Booking pages**:
   - `src/app/ferry/booking/page.tsx` - Ferry booking
   - `src/app/activities/booking/page.tsx` - Activities booking
   - `src/app/boat/booking/page.tsx` - Boat booking

## Content Structure and Relationships

### Page Content Structure

- Each page has a corresponding `page.content.ts` file
- Content is exported as a structured object with sections like `banner`, `title`, `description`, etc.
- Example:

```typescript
export const content = {
  banner: {...},
  title: {...},
  description: {...}
}
```

### SectionBlock Content Structure

- Each SectionBlock component has its own content file
- Content is specific to that component's needs
- Example:

```typescript
export const content = {
  title: "...",
  items: [...]
}
```

### Content-Component Relationship

- Pages import content from their corresponding content files
- Pages import SectionBlock components from the components directory
- SectionBlocks import their own content from their content files

## Icon System

### Icon Directory Structure

The project uses SVG icons organized in the following directory structure:

```
public/icons/
├── logo.svg
├── logo_white.svg
├── misc/
│   ├── approved.svg
│   ├── boat.svg
│   ├── boatSail.svg
│   ├── box.svg
│   ├── cab.svg
│   ├── chair.svg
│   ├── check.svg
│   ├── checkbox.svg
│   ├── circle_filled.svg
│   ├── circle_unfilled.svg
│   ├── clock.svg
│   ├── crown.svg
│   ├── ferry.svg
│   ├── fishingHook.svg
│   ├── flower.svg
│   ├── heart.svg
│   ├── island.svg
│   ├── legRoom.svg
│   ├── location.svg
│   ├── poolLadder.svg
│   ├── quote.svg
│   ├── rupee.svg
│   ├── ship.svg
│   ├── smilie.svg
│   ├── snorkeling.svg
│   ├── star.svg
│   ├── team.svg
│   ├── teaCup.svg
│   ├── ticket.svg
│   ├── users.svg
│   └── wind.svg
├── partners/
│   ├── dss.svg
│   ├── greenOcean.svg
│   ├── makruzz.svg
│   └── nautika.svg
└── socials/
    ├── google.svg
    ├── instagram.svg
    ├── linkedin.svg
    ├── threads.svg
    └── youtube.svg
```

### Icon Import System

Icons are imported using path aliases defined in `tsconfig.json`:

```typescript
// Example icon import
import UsersIcon from "@icons/misc/users.svg";
import FerryIcon from "@icons/misc/ferry.svg";
import IslandIcon from "@icons/misc/island.svg";
import logo from "@icons/logo_white.svg";
```

### Icon Usage in Components

#### 1. Direct SVG Imports

Many components import SVG icons directly and use them with Next.js Image component:

```typescript
// Example from StatCard.tsx
import UsersIcon from "@icons/misc/users.svg";
import FerryIcon from "@icons/misc/ferry.svg";
import IslandIcon from "@icons/misc/island.svg";

const iconMap = {
  users: { src: UsersIcon, alt: "Users icon" },
  ferry: { src: FerryIcon, alt: "Ferry icon" },
  island: { src: IslandIcon, alt: "Island icon" },
};

// Usage in component
<Image src={iconData.src} alt={iconData.alt} width={20} height={20} />;
```

#### 2. Lucide React Icons

For common UI icons, the project uses Lucide React:

```typescript
// Example from Button.tsx
import { MoveRight } from "lucide-react";

// Usage in component
<MoveRight size={16} aria-hidden="true" />;
```

```typescript
// Example from InlineLink.tsx
import { ArrowUpRight, ArrowRight } from "lucide-react";

// Usage with conditional rendering
{
  icon === "arrow-up-right" && <ArrowUpRight size={iconSize} />;
}
{
  icon === "arrow-right" && <ArrowRight size={iconSize} />;
}
```

#### 3. Icons in Content Files

Icons are referenced in content files, typically by their path:

```typescript
// Example from fishing/page.content.ts
import cabIcon from "@public/icons/misc/cab.svg";
import hookIcon from "@public/icons/misc/fishingHook.svg";
import boxIcon from "@public/icons/misc/box.svg";

export const content = {
  experience: {
    cards: [
      {
        title: "Free Pickup & Drop",
        description: "Relax - transport to the jetty and back is covered.",
        icon: cabIcon.src,
      },
      // ...more cards
    ],
  },
};
```

#### 4. Component-Specific Icon Props

Many components accept icons as props:

```typescript
// Example from FeatureCard.tsx
export const FeatureCard = memo<FeatureCardProps>(
  ({ title, description, icon, className, ...props }) => {
    return (
      <article {...props} className={cn(styles.featureCard, className)}>
        <div className={styles.iconContainer} aria-hidden="true">
          <Image src={icon} alt="" width={28} height={28} />
        </div>
        {/* ...rest of component */}
      </article>
    );
  }
);
```

```typescript
// Example from Chip.tsx
export const Chip = ({
  icon,
  iconComponent,
  text,
  className = "",
}: ChipProps) => {
  return (
    <div className={`${styles.chipContainer} ${className}`}>
      <div className={styles.iconWrapper}>
        {iconComponent ? (
          iconComponent
        ) : icon ? (
          <Image src={icon} alt="" width={20} height={20} />
        ) : null}
      </div>
      <span className={styles.chipText}>{text}</span>
    </div>
  );
};
```

## CMS Integration Considerations

### Current Content Management

- Content is separated from components in `.content.ts` files
- This separation facilitates future CMS integration

### Logical Structure for CMS

- **Page-level content**: 9 main content files for pages
- **Section-level content**: 60+ content files for section blocks
- **Component-level content**: Some components have their own content files

### Streamlining Recommendation

- Consider consolidating section block content into page content files where appropriate
- Maintain common/reusable section blocks as separate content files
- Create a clear hierarchy: Page Content → Section Content → Component Content

### CMS Schema Structure

- Create schemas that mirror the current content structure
- Page schemas with nested section schemas
- Common component schemas that can be reused across pages

### Icon Management in CMS

- Consider creating an icon picker component in the CMS
- Map icon names to their paths in the codebase
- Allow content editors to select icons from a visual interface
- Store icon references as strings (paths) in the CMS

### Image Management

- Set up media library in the CMS for managing images
- Store image references as URLs or paths in the CMS
- Update content files to use CMS image URLs instead of local imports

## Next Steps

1. **Choose a CMS Platform**: Select a headless CMS that supports structured content (e.g., Contentful, Sanity, Strapi)
2. **Define Content Models**: Create content models based on the existing content structure
3. **Create Component Mappings**: Map CMS content types to React components
4. **Implement API Integration**: Set up API calls to fetch content from the CMS
5. **Update Content Imports**: Replace static content imports with dynamic CMS data
6. **Create Icon Management System**: Set up a system for managing icons in the CMS
7. **Migrate Content**: Transfer existing content from `.content.ts` files to the CMS
8. **Test and Validate**: Ensure all components render correctly with CMS data
