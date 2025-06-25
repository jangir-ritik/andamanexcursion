---
to: src/components/<%= name %>/<%= name %>.tsx
---
import clsx from "clsx";
import styles from "./<%= name %>.module.css";

export type <%= name %>Props = {
  className?: string;
  // Add more props as needed
};

export function <%= name %>({ className, ...props }: <%= name %>Props) {
  return (
    <div className={clsx(styles.root, className)} {...props}>
      {/* TODO: Add component content */}
    </div>
  );
} 