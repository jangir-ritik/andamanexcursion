export interface FerryCardProps {
  ferryName: string;
  rating: number;
  departureTime: string;
  departureLocation: string;
  arrivalTime: string;
  arrivalLocation: string;
  price: number;
  totalPrice: number;
  seatsLeft: number;
  ferryClasses: FerryClassOption[];
  ferryImages?: string[];
  onChooseSeats?: (classType: string) => void;
  className?: string;
  ferryIndex?: number;
  detailsUrl?: string;
}

export interface FerryClassOption {
  type: string;
  price: number;
  totalPrice: number;
  seatsLeft: number;
  amenities: FerryAmenity[];
}

export interface FerryAmenity {
  icon: string;
  label: string;
}
