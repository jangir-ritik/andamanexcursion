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
  originalPrice?: number; // Original price before discount
  originalTotalPrice?: number; // Original total price before discount
  type: string;
  duration: string;
  href?: string;
  className?: string;
  activityOptions?: ActivityOption[];
  availableTimeSlots?: Array<{
    id: string;
    startTime: string;
    endTime?: string;
    displayTime: string;
    isAvailable: boolean;
  }>;
  onSelectActivity?: (activityId: string, optionId: string) => void;
  selectedOptionId?: string;
}

export interface ActivityOption {
  id: string;
  type: string;
  price: number;
  totalPrice: number;
  originalPrice?: number;
  originalTotalPrice?: number;
  description: string;
  seatsLeft: number;
  amenities?: {
    icon: string;
    label: string;
  }[];
}
