export interface HiddenGemsProps {
  content: HiddenGemsContent;
}

export interface HiddenGemsContent {
  title: string;
  specialWord: string;
  description: string;
  ctaText: string;
  ctaHref: string;
  images: {
    island1: {
      src: string;
      alt: string;
    };
    island2: {
      src: string;
      alt: string;
    };
    island3: {
      src: string;
      alt: string;
    };
  };
}
