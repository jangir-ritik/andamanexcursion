graph TB
subgraph "Navigation System"
A[Navigation.tsx Config] --> B[getNavigationData.ts]
C[Pages Collection] --> D[pageService]
D --> B
B --> E[DesktopNav Component]
E --> F[Nested Dropdown Display]
end

    subgraph "URL Routing System"
        G["/destinations/[main]"] --> H[Main Category Pages]
        I["/destinations/[main]/[sub]"] --> J[Subcategory Pages]
        K["/destinations/[slug]"] --> L[Legacy Redirect Handler]
    end

    subgraph "Page Collection Structure"
        M[Main Destinations<br/>Port Blair, Havelock, etc.] --> N[mainCategorySlug<br/>port-blair, havelock]
        O[Sub Destinations<br/>Cellular Jail, Radhanagar Beach] --> P[subcategorySlug<br/>cellular-jail, radhanagar-beach]
        M --> Q[Parent-Child Relationship]
        O --> Q
    end

    subgraph "Data Flow"
        R[Admin Creates Pages] --> S[Validation Hooks]
        S --> T[Auto-generate URLs]
        T --> U[Navigation Auto-population]
        U --> V[Nested Dropdown Rendering]
    end

    H --> |Main Category| W["/destinations/port-blair"]
    J --> |Subcategory| X["/destinations/port-blair/cellular-jail"]
    L --> |Redirects to| H
    L --> |Redirects to| J

    style A fill:#e1f5fe
    style E fill:#fff3e0
    style H fill:#f3e5f5
    style J fill:#f3e5f5
