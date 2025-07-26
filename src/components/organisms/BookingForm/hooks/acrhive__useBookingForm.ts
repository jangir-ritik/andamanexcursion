import { useForm, UseFormProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ZodSchema, z } from "zod";
// import { useBooking } from "@/context/BookingContext";

/**
 * Custom hook for booking forms with Zod validation
 * @param schema The Zod schema for form validation
 * @param defaultValues Default values for the form
 * @param options Additional options for useForm
 * @returns The form methods from useForm
 */
export function useBookingForm<T extends ZodSchema<any>>(
  schema: T,
  defaultValues: z.infer<T>,
  options?: Omit<UseFormProps<z.infer<T>>, "resolver" | "defaultValues">
) {
  // const { bookingState } = useBooking();

  return useForm<z.infer<T>>({
    resolver: zodResolver(schema as any),
    defaultValues,
    mode: "onSubmit", // Only validate on submit
    ...options,
  });
}

/**
 * Helper function to format form data for submission
 * @param data Form data
 * @returns Formatted data for submission
 */
export function formatFormData(data: any) {
  return {
    date: data.selectedDate?.toISOString().split("T")[0],
    time: data.selectedSlot,
    passengers: {
      adults: data.passengers.adults,
      children: data.passengers.children,
      infants: data.passengers.infants,
    },
  };
}
