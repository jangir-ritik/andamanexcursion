export interface ActivityCardProps {
  id: string;
  title: string;
  description: string;
  images: {
    src: string;
    alt: string;
  }[];
  price: number;
  totalPrice: number;
  type: string;
  duration: string;
  href?: string;
  className?: string;
  activityOptions?: ActivityOption[];
  onSelectActivity?: (activityId: string, optionId: string) => void;
  selectedOptionId?: string;
}

export interface ActivityOption {
  id: string;
  type: string;
  price: number;
  totalPrice: number;
  description: string;
  seatsLeft: number;
  amenities?: {
    icon: string;
    label: string;
  }[];
}
