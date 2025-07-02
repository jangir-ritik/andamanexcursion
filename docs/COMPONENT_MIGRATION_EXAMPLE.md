# Component Migration Example

This document provides an example of how to migrate an existing component to the simplified structure.

## Before: Traditional Component Structure

### Component File: `src/components/atoms/ExampleButton/ExampleButton.tsx`

```tsx
import React from "react";
import styles from "./ExampleButton.module.css";
import { ExampleButtonProps } from "@/types/components/atoms/exampleButton";

export const ExampleButton = ({
  children,
  onClick,
  variant = "primary",
}: ExampleButtonProps) => {
  return (
    <button className={`${styles.button} ${styles[variant]}`} onClick={onClick}>
      {children}
    </button>
  );
};
```

### Type File: `src/types/components/atoms/exampleButton.ts`

```tsx
import { ReactNode } from "react";

export interface ExampleButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
}
```

### Index File: `src/components/atoms/ExampleButton/index.ts`

```tsx
export * from "./ExampleButton";
```

## After: Simplified Component Structure

### Component File: `src/components/atoms/ExampleButton/ExampleButton.tsx`

```tsx
import React from "react";
import styles from "./ExampleButton.module.css";
import { ReactNode } from "react";

export interface ExampleButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
}

export const ExampleButton = ({
  children,
  onClick,
  variant = "primary",
}: ExampleButtonProps) => {
  return (
    <button className={`${styles.button} ${styles[variant]}`} onClick={onClick}>
      {children}
    </button>
  );
};
```

### CSS Module: `src/components/atoms/ExampleButton/ExampleButton.module.css`

```css
/* CSS remains the same */
.button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.primary {
  background-color: var(--color-primary);
  color: var(--color-white);
}

.secondary {
  background-color: var(--color-secondary);
  color: var(--color-white);
}
```

## Key Changes

1. **Moved Types Inline**: The type definition is now directly in the component file
2. **Removed Index File**: For simple components, the index.ts file is unnecessary
3. **Import Path Changes**: When importing this component, use:

   ```tsx
   // Before
   import { ExampleButton } from "@/components/atoms/ExampleButton";

   // After
   import { ExampleButton } from "@/components/atoms/ExampleButton/ExampleButton";
   ```

## When to Keep the Index File

Keep the index.ts file if:

1. The component is imported frequently across the codebase
2. The component has multiple exports
3. You want to maintain a consistent public API for a feature folder

## When to Keep Separate Type Files

Keep separate type files if:

1. The types are complex and shared across multiple components
2. The types include utility types, enums, or other complex TypeScript features
3. The types are part of a public API that might be consumed by other modules

## Migration Strategy

1. Start with simple components like atoms
2. Move types inline
3. Remove unnecessary index files
4. Update imports in other files
5. Keep content separation for section blocks and content-heavy components
