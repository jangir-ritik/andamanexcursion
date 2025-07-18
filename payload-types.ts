/* tslint:disable */
/* eslint-disable */
/**
 * This file was automatically generated by Payload.
 * DO NOT MODIFY IT BY HAND. Instead, modify your source Payload config,
 * and re-run `payload generate:types` to regenerate this file.
 */

/**
 * Supported timezones in IANA format.
 *
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "supportedTimezones".
 */
export type SupportedTimezones =
  | 'Pacific/Midway'
  | 'Pacific/Niue'
  | 'Pacific/Honolulu'
  | 'Pacific/Rarotonga'
  | 'America/Anchorage'
  | 'Pacific/Gambier'
  | 'America/Los_Angeles'
  | 'America/Tijuana'
  | 'America/Denver'
  | 'America/Phoenix'
  | 'America/Chicago'
  | 'America/Guatemala'
  | 'America/New_York'
  | 'America/Bogota'
  | 'America/Caracas'
  | 'America/Santiago'
  | 'America/Buenos_Aires'
  | 'America/Sao_Paulo'
  | 'Atlantic/South_Georgia'
  | 'Atlantic/Azores'
  | 'Atlantic/Cape_Verde'
  | 'Europe/London'
  | 'Europe/Berlin'
  | 'Africa/Lagos'
  | 'Europe/Athens'
  | 'Africa/Cairo'
  | 'Europe/Moscow'
  | 'Asia/Riyadh'
  | 'Asia/Dubai'
  | 'Asia/Baku'
  | 'Asia/Karachi'
  | 'Asia/Tashkent'
  | 'Asia/Calcutta'
  | 'Asia/Dhaka'
  | 'Asia/Almaty'
  | 'Asia/Jakarta'
  | 'Asia/Bangkok'
  | 'Asia/Shanghai'
  | 'Asia/Singapore'
  | 'Asia/Tokyo'
  | 'Asia/Seoul'
  | 'Australia/Brisbane'
  | 'Australia/Sydney'
  | 'Pacific/Guam'
  | 'Pacific/Noumea'
  | 'Pacific/Auckland'
  | 'Pacific/Fiji';

export interface Config {
  auth: {
    users: UserAuthOperations;
  };
  blocks: {};
  collections: {
    users: User;
    media: Media;
    pages: Page;
    packages: Package;
    'package-categories': PackageCategory;
    'package-periods': PackagePeriod;
    'payload-locked-documents': PayloadLockedDocument;
    'payload-preferences': PayloadPreference;
    'payload-migrations': PayloadMigration;
  };
  collectionsJoins: {};
  collectionsSelect: {
    users: UsersSelect<false> | UsersSelect<true>;
    media: MediaSelect<false> | MediaSelect<true>;
    pages: PagesSelect<false> | PagesSelect<true>;
    packages: PackagesSelect<false> | PackagesSelect<true>;
    'package-categories': PackageCategoriesSelect<false> | PackageCategoriesSelect<true>;
    'package-periods': PackagePeriodsSelect<false> | PackagePeriodsSelect<true>;
    'payload-locked-documents': PayloadLockedDocumentsSelect<false> | PayloadLockedDocumentsSelect<true>;
    'payload-preferences': PayloadPreferencesSelect<false> | PayloadPreferencesSelect<true>;
    'payload-migrations': PayloadMigrationsSelect<false> | PayloadMigrationsSelect<true>;
  };
  db: {
    defaultIDType: string;
  };
  globals: {};
  globalsSelect: {};
  locale: null;
  user: User & {
    collection: 'users';
  };
  jobs: {
    tasks: unknown;
    workflows: unknown;
  };
}
export interface UserAuthOperations {
  forgotPassword: {
    email: string;
    password: string;
  };
  login: {
    email: string;
    password: string;
  };
  registerFirstUser: {
    email: string;
    password: string;
  };
  unlock: {
    email: string;
    password: string;
  };
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "users".
 */
export interface User {
  id: string;
  name?: string | null;
  updatedAt: string;
  createdAt: string;
  email: string;
  resetPasswordToken?: string | null;
  resetPasswordExpiration?: string | null;
  salt?: string | null;
  hash?: string | null;
  loginAttempts?: number | null;
  lockUntil?: string | null;
  sessions?:
    | {
        id: string;
        createdAt?: string | null;
        expiresAt: string;
      }[]
    | null;
  password?: string | null;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "media".
 */
export interface Media {
  id: string;
  alt: string;
  caption?: string | null;
  updatedAt: string;
  createdAt: string;
  url?: string | null;
  thumbnailURL?: string | null;
  filename?: string | null;
  mimeType?: string | null;
  filesize?: number | null;
  width?: number | null;
  height?: number | null;
  focalX?: number | null;
  focalY?: number | null;
  sizes?: {
    thumbnail?: {
      url?: string | null;
      width?: number | null;
      height?: number | null;
      mimeType?: string | null;
      filesize?: number | null;
      filename?: string | null;
    };
    card?: {
      url?: string | null;
      width?: number | null;
      height?: number | null;
      mimeType?: string | null;
      filesize?: number | null;
      filename?: string | null;
    };
    tablet?: {
      url?: string | null;
      width?: number | null;
      height?: number | null;
      mimeType?: string | null;
      filesize?: number | null;
      filename?: string | null;
    };
    desktop?: {
      url?: string | null;
      width?: number | null;
      height?: number | null;
      mimeType?: string | null;
      filesize?: number | null;
      filename?: string | null;
    };
  };
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "pages".
 */
export interface Page {
  id: string;
  /**
   * Main title of the page
   */
  title: string;
  /**
   * URL path for this page (e.g., /about-us)
   */
  slug: string;
  /**
   * Essential page details
   */
  basicInfo: {
    /**
     * Type of page this is
     */
    pageType: 'home' | 'activities' | 'fishing' | 'live-volcanos' | 'specials' | 'packages' | 'how-to-reach';
  };
  /**
   * Search engine optimization settings
   */
  seoMeta?: {
    metaTitle?: string | null;
    metaDescription?: string | null;
    metaImage?: (string | null) | Media;
  };
  /**
   * Main content blocks for this page
   */
  pageContent?: {
    /**
     * Add and arrange content blocks for this page
     */
    content?:
      | (
          | {
              title: string;
              subtitle: string;
              description: string;
              image: string | Media;
              ctaText: string;
              ctaHref: string;
              id?: string | null;
              blockName?: string | null;
              blockType: 'hero';
            }
          | {
              title: string;
              /**
               * Word to highlight in the title
               */
              specialWord?: string | null;
              description?: string | null;
              image?: (string | null) | Media;
              imageAlt?: string | null;
              ctaText?: string | null;
              ctaHref?: string | null;
              id?: string | null;
              blockName?: string | null;
              blockType: 'feature';
            }
          | {
              title: string;
              specialWord: string;
              items?:
                | {
                    question: string;
                    answer: string;
                    id?: string | null;
                  }[]
                | null;
              id?: string | null;
              blockName?: string | null;
              blockType: 'faq';
            }
          | {
              subtitle?: string | null;
              title: string;
              image?: (string | null) | Media;
              imageAlt?: string | null;
              ctaText?: string | null;
              ctaHref?: string | null;
              id?: string | null;
              blockName?: string | null;
              blockType: 'largeCard';
            }
          | {
              title: string;
              text: string;
              highlightedPhrases?:
                | {
                    phrase?: string | null;
                    id?: string | null;
                  }[]
                | null;
              id?: string | null;
              blockName?: string | null;
              blockType: 'trivia';
            }
          | {
              title: string;
              specialWord?: string | null;
              description?: string | null;
              cards?:
                | {
                    title: string;
                    description?: string | null;
                    icon?: (string | null) | Media;
                    id?: string | null;
                  }[]
                | null;
              id?: string | null;
              blockName?: string | null;
              blockType: 'experience';
            }
          | {
              title?: {
                text?: string | null;
                specialWord?: string | null;
              };
              stats?:
                | {
                    value: string;
                    description: string;
                    /**
                     * Icon identifier - one of (users, ferry, island)
                     */
                    icon?: string | null;
                    id?: string | null;
                  }[]
                | null;
              id?: string | null;
              blockName?: string | null;
              blockType: 'trustStats';
            }
          | {
              title: string;
              specialWord?: string | null;
              description?: string | null;
              points?:
                | {
                    title: string;
                    description?: string | null;
                    id?: string | null;
                  }[]
                | null;
              image?: (string | null) | Media;
              imageAlt?: string | null;
              ctaText?: string | null;
              ctaHref?: string | null;
              id?: string | null;
              blockName?: string | null;
              blockType: 'whyChooseUs';
            }
          | {
              title: string;
              description?: string | null;
              slides?:
                | {
                    title: string;
                    price?: string | null;
                    description?: string | null;
                    image?: (string | null) | Media;
                    id?: string | null;
                  }[]
                | null;
              id?: string | null;
              blockName?: string | null;
              blockType: 'packageCarousel';
            }
          | {
              title: string;
              specialWord?: string | null;
              description?: string | null;
              ctaText?: string | null;
              ctaHref?: string | null;
              images?:
                | {
                    image: string | Media;
                    /**
                     * Alt text for the image in this context (e.g. 'Island 1', 'Island 2', 'Island 3')
                     */
                    alt: string;
                    id?: string | null;
                  }[]
                | null;
              id?: string | null;
              blockName?: string | null;
              blockType: 'hiddenGems';
            }
          | {
              title: string;
              specialWord: string;
              adventures?:
                | {
                    title: string;
                    description: string;
                    image: string | Media;
                    imageAlt: string;
                    badgeLabel: string;
                    badgeIcon: 'Star' | 'Heart';
                    href: string | Page;
                    id?: string | null;
                  }[]
                | null;
              id?: string | null;
              blockName?: string | null;
              blockType: 'topAdventures';
            }
          | {
              title: string;
              specialWord?: string | null;
              description?: string | null;
              fishes?:
                | {
                    title: string;
                    subtitle?: string | null;
                    image?: (string | null) | Media;
                    imageAlt?: string | null;
                    id?: string | null;
                  }[]
                | null;
              id?: string | null;
              blockName?: string | null;
              blockType: 'famousFishes';
            }
          | {
              title: string;
              specialWord?: string | null;
              cards?:
                | {
                    title: string;
                    description?: string | null;
                    icon?: (string | null) | Media;
                    id?: string | null;
                  }[]
                | null;
              id?: string | null;
              blockName?: string | null;
              blockType: 'howToReach';
            }
          | {
              title: string;
              /**
               * Word to highlight in the title
               */
              specialWord: string;
              partners?:
                | {
                    partner: string | Media;
                    alt?: string | null;
                    id?: string | null;
                  }[]
                | null;
              id?: string | null;
              blockName?: string | null;
              blockType: 'partners';
            }
          | {
              title: string;
              specialWord: string;
              description: string;
              /**
               * Upload a video file; should be a .mp4 file; size should be less than 10MB
               */
              video: string | Media;
              /**
               * Alt text for the video
               */
              alt: string;
              id?: string | null;
              blockName?: string | null;
              blockType: 'story';
            }
          | {
              title: string;
              /**
               * Word to highlight in the title
               */
              specialWord?: string | null;
              subtitle?: string | null;
              testimonials?:
                | {
                    text: string;
                    author?: string | null;
                    avatar: string | Media;
                    /**
                     * Rotation of the testimonial card in degrees
                     */
                    rotation: number;
                    id?: string | null;
                  }[]
                | null;
              id?: string | null;
              blockName?: string | null;
              blockType: 'testimonials';
            }
        )[]
      | null;
  };
  /**
   * Control page visibility and publishing
   */
  publishingSettings?: {
    /**
     * Publishing status of this page
     */
    status?: ('draft' | 'published' | 'archived') | null;
    /**
     * When this page was published
     */
    publishedAt?: string | null;
  };
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "packages".
 */
export interface Package {
  id: string;
  title: string;
  /**
   * URL-friendly version of the title (auto-generated if empty)
   */
  slug: string;
  /**
   * Core details of the package
   */
  coreInfo: {
    /**
     * Select the package category
     */
    category: string | PackageCategory;
    /**
     * Select the package period
     */
    period: string | PackagePeriod;
    location: string;
  };
  /**
   * Descriptions for the package
   */
  descriptions: {
    description: string;
    /**
     * Brief description for cards and listings
     */
    shortDescription?: string | null;
  };
  /**
   * Pricing details
   */
  pricing: {
    /**
     * Price in your currency
     */
    price: number;
    /**
     * Original price (for showing discounts)
     */
    originalPrice?: number | null;
  };
  /**
   * Images for the package
   */
  media: {
    images: {
      image: string | Media;
      alt: string;
      caption?: string | null;
      id?: string | null;
    }[];
  };
  /**
   * Detailed package information
   */
  packageDetails?: {
    highlights?:
      | {
          highlight: string;
          id?: string | null;
        }[]
      | null;
    inclusions?:
      | {
          inclusion: string;
          id?: string | null;
        }[]
      | null;
    exclusions?:
      | {
          exclusion: string;
          id?: string | null;
        }[]
      | null;
    itinerary?:
      | {
          day: number;
          title: string;
          description?: string | null;
          activities?:
            | {
                activity: string;
                id?: string | null;
              }[]
            | null;
          id?: string | null;
        }[]
      | null;
    accommodation?: string | null;
    transportation?: string | null;
    bestTimeToVisit?: string | null;
    specialNotes?: string | null;
  };
  /**
   * Settings for featuring the package
   */
  featuredSettings?: {
    /**
     * Show in top 3 packages on homepage
     */
    featured?: boolean | null;
    /**
     * Order for featured packages (1-3)
     */
    featuredOrder?: number | null;
  };
  /**
   * SEO settings
   */
  seo?: {
    metaTitle?: string | null;
    metaDescription?: string | null;
    metaImage?: (string | null) | Media;
  };
  /**
   * Control page visibility and publishing
   */
  publishingSettings?: {
    /**
     * Publishing status of this page
     */
    status?: ('draft' | 'published' | 'archived') | null;
    /**
     * When this page was published
     */
    publishedAt?: string | null;
  };
  updatedAt: string;
  createdAt: string;
}
/**
 * Manage package category information displayed on the website
 *
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "package-categories".
 */
export interface PackageCategory {
  id: string;
  /**
   * Display title for the category (e.g., "Honeymoon Packages")
   */
  title: string;
  /**
   * URL slug (e.g., "honeymoon-retreat")
   */
  slug: string;
  categoryDetails: {
    /**
     * Brief description shown on category cards
     */
    description: string;
    /**
     * Shorter version for compact displays
     */
    shortDescription?: string | null;
  };
  media?: {
    /**
     * Main image for the category
     */
    heroImage?: (string | null) | Media;
    /**
     * Images shown on category cards (max 3)
     */
    cardImages?:
      | {
          image: string | Media;
          alt: string;
          id?: string | null;
        }[]
      | null;
  };
  displaySettings: {
    /**
     * Display order on the packages page
     */
    order: number;
    /**
     * Show this category on the website
     */
    isActive?: boolean | null;
    /**
     * Feature this category prominently
     */
    isFeatured?: boolean | null;
    /**
     * Custom page title for category page (e.g., "Honeymoon")
     */
    pageTitle?: string | null;
    /**
     * Word to highlight in the page title
     */
    specialWord?: string | null;
  };
  content?: {
    /**
     * Key highlights or features of this category
     */
    highlights?:
      | {
          highlight?: string | null;
          id?: string | null;
        }[]
      | null;
    /**
     * Popular destinations for this category
     */
    popularDestinations?:
      | {
          destination?: string | null;
          isPopular?: boolean | null;
          id?: string | null;
        }[]
      | null;
  };
  seo?: {
    /**
     * SEO title (leave empty to auto-generate)
     */
    metaTitle?: string | null;
    /**
     * SEO description (leave empty to auto-generate)
     */
    metaDescription?: string | null;
    metaImage?: (string | null) | Media;
    /**
     * SEO keywords for this category
     */
    keywords?:
      | {
          keyword?: string | null;
          id?: string | null;
        }[]
      | null;
    systemCategoryId?: string | null;
  };
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "package-periods".
 */
export interface PackagePeriod {
  id: string;
  /**
   * Display name (e.g., '3 Days 2 Nights')
   */
  title: string;
  /**
   * Internal value (e.g., '3-2')
   */
  value: string;
  /**
   * Short display name (e.g., '3D 2N')
   */
  shortTitle?: string | null;
  /**
   * Display order in selectors
   */
  order?: number | null;
  /**
   * Whether this period is active in the selector
   */
  isActive?: boolean | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "payload-locked-documents".
 */
export interface PayloadLockedDocument {
  id: string;
  document?:
    | ({
        relationTo: 'users';
        value: string | User;
      } | null)
    | ({
        relationTo: 'media';
        value: string | Media;
      } | null)
    | ({
        relationTo: 'pages';
        value: string | Page;
      } | null)
    | ({
        relationTo: 'packages';
        value: string | Package;
      } | null)
    | ({
        relationTo: 'package-categories';
        value: string | PackageCategory;
      } | null)
    | ({
        relationTo: 'package-periods';
        value: string | PackagePeriod;
      } | null);
  globalSlug?: string | null;
  user: {
    relationTo: 'users';
    value: string | User;
  };
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "payload-preferences".
 */
export interface PayloadPreference {
  id: string;
  user: {
    relationTo: 'users';
    value: string | User;
  };
  key?: string | null;
  value?:
    | {
        [k: string]: unknown;
      }
    | unknown[]
    | string
    | number
    | boolean
    | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "payload-migrations".
 */
export interface PayloadMigration {
  id: string;
  name?: string | null;
  batch?: number | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "users_select".
 */
export interface UsersSelect<T extends boolean = true> {
  name?: T;
  updatedAt?: T;
  createdAt?: T;
  email?: T;
  resetPasswordToken?: T;
  resetPasswordExpiration?: T;
  salt?: T;
  hash?: T;
  loginAttempts?: T;
  lockUntil?: T;
  sessions?:
    | T
    | {
        id?: T;
        createdAt?: T;
        expiresAt?: T;
      };
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "media_select".
 */
export interface MediaSelect<T extends boolean = true> {
  alt?: T;
  caption?: T;
  updatedAt?: T;
  createdAt?: T;
  url?: T;
  thumbnailURL?: T;
  filename?: T;
  mimeType?: T;
  filesize?: T;
  width?: T;
  height?: T;
  focalX?: T;
  focalY?: T;
  sizes?:
    | T
    | {
        thumbnail?:
          | T
          | {
              url?: T;
              width?: T;
              height?: T;
              mimeType?: T;
              filesize?: T;
              filename?: T;
            };
        card?:
          | T
          | {
              url?: T;
              width?: T;
              height?: T;
              mimeType?: T;
              filesize?: T;
              filename?: T;
            };
        tablet?:
          | T
          | {
              url?: T;
              width?: T;
              height?: T;
              mimeType?: T;
              filesize?: T;
              filename?: T;
            };
        desktop?:
          | T
          | {
              url?: T;
              width?: T;
              height?: T;
              mimeType?: T;
              filesize?: T;
              filename?: T;
            };
      };
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "pages_select".
 */
export interface PagesSelect<T extends boolean = true> {
  title?: T;
  slug?: T;
  basicInfo?:
    | T
    | {
        pageType?: T;
      };
  seoMeta?:
    | T
    | {
        metaTitle?: T;
        metaDescription?: T;
        metaImage?: T;
      };
  pageContent?:
    | T
    | {
        content?:
          | T
          | {
              hero?:
                | T
                | {
                    title?: T;
                    subtitle?: T;
                    description?: T;
                    image?: T;
                    ctaText?: T;
                    ctaHref?: T;
                    id?: T;
                    blockName?: T;
                  };
              feature?:
                | T
                | {
                    title?: T;
                    specialWord?: T;
                    description?: T;
                    image?: T;
                    imageAlt?: T;
                    ctaText?: T;
                    ctaHref?: T;
                    id?: T;
                    blockName?: T;
                  };
              faq?:
                | T
                | {
                    title?: T;
                    specialWord?: T;
                    items?:
                      | T
                      | {
                          question?: T;
                          answer?: T;
                          id?: T;
                        };
                    id?: T;
                    blockName?: T;
                  };
              largeCard?:
                | T
                | {
                    subtitle?: T;
                    title?: T;
                    image?: T;
                    imageAlt?: T;
                    ctaText?: T;
                    ctaHref?: T;
                    id?: T;
                    blockName?: T;
                  };
              trivia?:
                | T
                | {
                    title?: T;
                    text?: T;
                    highlightedPhrases?:
                      | T
                      | {
                          phrase?: T;
                          id?: T;
                        };
                    id?: T;
                    blockName?: T;
                  };
              experience?:
                | T
                | {
                    title?: T;
                    specialWord?: T;
                    description?: T;
                    cards?:
                      | T
                      | {
                          title?: T;
                          description?: T;
                          icon?: T;
                          id?: T;
                        };
                    id?: T;
                    blockName?: T;
                  };
              trustStats?:
                | T
                | {
                    title?:
                      | T
                      | {
                          text?: T;
                          specialWord?: T;
                        };
                    stats?:
                      | T
                      | {
                          value?: T;
                          description?: T;
                          icon?: T;
                          id?: T;
                        };
                    id?: T;
                    blockName?: T;
                  };
              whyChooseUs?:
                | T
                | {
                    title?: T;
                    specialWord?: T;
                    description?: T;
                    points?:
                      | T
                      | {
                          title?: T;
                          description?: T;
                          id?: T;
                        };
                    image?: T;
                    imageAlt?: T;
                    ctaText?: T;
                    ctaHref?: T;
                    id?: T;
                    blockName?: T;
                  };
              packageCarousel?:
                | T
                | {
                    title?: T;
                    description?: T;
                    slides?:
                      | T
                      | {
                          title?: T;
                          price?: T;
                          description?: T;
                          image?: T;
                          id?: T;
                        };
                    id?: T;
                    blockName?: T;
                  };
              hiddenGems?:
                | T
                | {
                    title?: T;
                    specialWord?: T;
                    description?: T;
                    ctaText?: T;
                    ctaHref?: T;
                    images?:
                      | T
                      | {
                          image?: T;
                          alt?: T;
                          id?: T;
                        };
                    id?: T;
                    blockName?: T;
                  };
              topAdventures?:
                | T
                | {
                    title?: T;
                    specialWord?: T;
                    adventures?:
                      | T
                      | {
                          title?: T;
                          description?: T;
                          image?: T;
                          imageAlt?: T;
                          badgeLabel?: T;
                          badgeIcon?: T;
                          href?: T;
                          id?: T;
                        };
                    id?: T;
                    blockName?: T;
                  };
              famousFishes?:
                | T
                | {
                    title?: T;
                    specialWord?: T;
                    description?: T;
                    fishes?:
                      | T
                      | {
                          title?: T;
                          subtitle?: T;
                          image?: T;
                          imageAlt?: T;
                          id?: T;
                        };
                    id?: T;
                    blockName?: T;
                  };
              howToReach?:
                | T
                | {
                    title?: T;
                    specialWord?: T;
                    cards?:
                      | T
                      | {
                          title?: T;
                          description?: T;
                          icon?: T;
                          id?: T;
                        };
                    id?: T;
                    blockName?: T;
                  };
              partners?:
                | T
                | {
                    title?: T;
                    specialWord?: T;
                    partners?:
                      | T
                      | {
                          partner?: T;
                          alt?: T;
                          id?: T;
                        };
                    id?: T;
                    blockName?: T;
                  };
              story?:
                | T
                | {
                    title?: T;
                    specialWord?: T;
                    description?: T;
                    video?: T;
                    alt?: T;
                    id?: T;
                    blockName?: T;
                  };
              testimonials?:
                | T
                | {
                    title?: T;
                    specialWord?: T;
                    subtitle?: T;
                    testimonials?:
                      | T
                      | {
                          text?: T;
                          author?: T;
                          avatar?: T;
                          rotation?: T;
                          id?: T;
                        };
                    id?: T;
                    blockName?: T;
                  };
            };
      };
  publishingSettings?:
    | T
    | {
        status?: T;
        publishedAt?: T;
      };
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "packages_select".
 */
export interface PackagesSelect<T extends boolean = true> {
  title?: T;
  slug?: T;
  coreInfo?:
    | T
    | {
        category?: T;
        period?: T;
        location?: T;
      };
  descriptions?:
    | T
    | {
        description?: T;
        shortDescription?: T;
      };
  pricing?:
    | T
    | {
        price?: T;
        originalPrice?: T;
      };
  media?:
    | T
    | {
        images?:
          | T
          | {
              image?: T;
              alt?: T;
              caption?: T;
              id?: T;
            };
      };
  packageDetails?:
    | T
    | {
        highlights?:
          | T
          | {
              highlight?: T;
              id?: T;
            };
        inclusions?:
          | T
          | {
              inclusion?: T;
              id?: T;
            };
        exclusions?:
          | T
          | {
              exclusion?: T;
              id?: T;
            };
        itinerary?:
          | T
          | {
              day?: T;
              title?: T;
              description?: T;
              activities?:
                | T
                | {
                    activity?: T;
                    id?: T;
                  };
              id?: T;
            };
        accommodation?: T;
        transportation?: T;
        bestTimeToVisit?: T;
        specialNotes?: T;
      };
  featuredSettings?:
    | T
    | {
        featured?: T;
        featuredOrder?: T;
      };
  seo?:
    | T
    | {
        metaTitle?: T;
        metaDescription?: T;
        metaImage?: T;
      };
  publishingSettings?:
    | T
    | {
        status?: T;
        publishedAt?: T;
      };
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "package-categories_select".
 */
export interface PackageCategoriesSelect<T extends boolean = true> {
  title?: T;
  slug?: T;
  categoryDetails?:
    | T
    | {
        description?: T;
        shortDescription?: T;
      };
  media?:
    | T
    | {
        heroImage?: T;
        cardImages?:
          | T
          | {
              image?: T;
              alt?: T;
              id?: T;
            };
      };
  displaySettings?:
    | T
    | {
        order?: T;
        isActive?: T;
        isFeatured?: T;
        pageTitle?: T;
        specialWord?: T;
      };
  content?:
    | T
    | {
        highlights?:
          | T
          | {
              highlight?: T;
              id?: T;
            };
        popularDestinations?:
          | T
          | {
              destination?: T;
              isPopular?: T;
              id?: T;
            };
      };
  seo?:
    | T
    | {
        metaTitle?: T;
        metaDescription?: T;
        metaImage?: T;
        keywords?:
          | T
          | {
              keyword?: T;
              id?: T;
            };
        systemCategoryId?: T;
      };
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "package-periods_select".
 */
export interface PackagePeriodsSelect<T extends boolean = true> {
  title?: T;
  value?: T;
  shortTitle?: T;
  order?: T;
  isActive?: T;
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "payload-locked-documents_select".
 */
export interface PayloadLockedDocumentsSelect<T extends boolean = true> {
  document?: T;
  globalSlug?: T;
  user?: T;
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "payload-preferences_select".
 */
export interface PayloadPreferencesSelect<T extends boolean = true> {
  user?: T;
  key?: T;
  value?: T;
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "payload-migrations_select".
 */
export interface PayloadMigrationsSelect<T extends boolean = true> {
  name?: T;
  batch?: T;
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "auth".
 */
export interface Auth {
  [k: string]: unknown;
}


declare module 'payload' {
  export interface GeneratedTypes extends Config {}
}