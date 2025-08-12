graph TB
subgraph "Automated Admin Experience"
A1[Page Title: 'Port Blair'] --> A2[Auto-generates Slug: 'port-blair']
A3[Main Destination Selected] --> A4[Auto-generates mainCategorySlug: 'port-blair']
A5[Sub-destination Title: 'Cellular Jail'] --> A6[Auto-generates subcategorySlug: 'cellular-jail']
end

    subgraph "Navigation Auto-Population"
        B1[Admin Creates Destination Pages] --> B2[Pages Collection]
        B2 --> B3[Navigation Service Auto-Detects]
        B3 --> B4[Auto-Populates Navigation Dropdown]
        B4 --> B5[No Manual Navigation Config Needed]
    end

    subgraph "Improved Workflow"
        C1[Admin Action: Create Page] --> C2[Select: Destination Type]
        C2 --> C3[Enter: Page Title ONLY]
        C3 --> C4[System Auto-Generates:]
        C4 --> C5[Page Slug]
        C4 --> C6[Navigation Links]
        C4 --> C7[URL Structure]
        C4 --> C8[Dropdown Display]
    end

    subgraph "Results"
        D1[Navigation Dropdown Shows:]
        D1 --> D2[Port Blair - bold, clickable]
        D2 --> D3[• Cellular Jail - indented]
        D2 --> D4[• Ross Island - indented]
        D1 --> D5[Havelock - bold, clickable]
        D5 --> D6[• Radhanagar Beach - indented]
    end

    style B3 fill:#e1f5fe
    style C4 fill:#fff3e0
    style D1 fill:#f3e5f5
