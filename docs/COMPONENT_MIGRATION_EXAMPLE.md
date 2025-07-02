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
import { ExampleButtonProps } from "./ExampleButton.types";

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

### Types File: `src/components/atoms/ExampleButton/ExampleButton.types.ts`

```tsx
import { ReactNode } from "react";

export interface ExampleButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
}
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

1. **Moved Types to Component Directory**: The type definition is now in a `.types.ts` file in the component directory
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

## Migration Strategy

1. Start with simple components like atoms
2. Move types from the central types directory to a `.types.ts` file in the component directory
3. Update imports in the component file to reference the local types file
4. Remove unnecessary index files
5. Update imports in other files
6. Keep content separation for section blocks and content-heavy components
