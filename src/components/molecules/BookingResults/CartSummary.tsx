import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/atoms";
import { useActivity } from "@/context/ActivityContext";
import styles from "./CartSummary.module.css";
import { Row, Column } from "@/components/layout";
import { Plus, ChevronRight, Edit2, Trash2 } from "lucide-react";

interface CartSummaryProps {
  className?: string;
  onAddMore?: () => void;
}

export const CartSummary: React.FC<CartSummaryProps> = ({
  className,
  onAddMore,
}) => {
  const router = useRouter();
  const { state, removeFromCart } = useActivity();
  const { cart } = state;

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Format time for display
  const formatTime = (timeString: string): string => {
    // If time is in format "HH-MM" convert to "HH:MM AM/PM"
    if (timeString.includes("-")) {
      const [hours, minutes] = timeString.split("-").map(Number);
      const ampm = hours >= 12 ? "PM" : "AM";
      const displayHours = hours % 12 || 12;
      return `${displayHours}:${minutes.toString().padStart(2, "0")}${ampm}`;
    }
    return timeString;
  };

  const handleRemove = (activityId: string) => {
    removeFromCart(activityId);
  };

  const handleEdit = (activityId: string) => {
    // For now, just scroll to form to modify selection
    const formElement = document.getElementById("booking-form-section");
    if (formElement) {
      formElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleNext = () => {
    router.push("/checkout");
  };

  if (cart.length === 0) {
    return null;
  }

  return (
    <div className={`${styles.cartSummaryContainer} ${className || ""}`}>
      <h2 className={styles.sectionTitle}>Your Activities</h2>

      <div className={styles.cartItemsContainer}>
        {cart.map((item) => {
          const activity = item.activity;
          const selectedOption = activity.activityOptions?.find(
            (option) => option.id === item.activityOptionId
          );

          const activityType = selectedOption?.optionTitle || "Standard";
          const location = activity.coreInfo.location?.[0]?.name || "Andaman";

          return (
            <div
              key={`${activity.id}-${item.activityOptionId}`}
              className={styles.cartItem}
            >
              <Row alignItems="center" justifyContent="between" fullWidth>
                <Column gap="var(--space-1)">
                  <div className={styles.cartItemHeader}>
                    <span className={styles.cartItemLabel}>
                      Selected Activity
                    </span>
                    <h3 className={styles.cartItemValue}>{activity.title}</h3>
                  </div>
                </Column>

                <Column gap="var(--space-1)">
                  <span className={styles.cartItemLabel}>Date</span>
                  <span className={styles.cartItemValue}>
                    {formatDate(state.searchParams.date)}
                  </span>
                </Column>

                <Column gap="var(--space-1)">
                  <span className={styles.cartItemLabel}>Time Slot</span>
                  <span className={styles.cartItemValue}>
                    {formatTime(state.searchParams.time)}
                  </span>
                </Column>

                <Column
                  gap="var(--space-1)"
                  alignItems="start"
                  style={{ flex: 2 }}
                >
                  <span className={styles.cartItemLabel}>{location}</span>
                  <span className={styles.cartItemValue}>{activityType}</span>
                </Column>

                <Column gap="var(--space-1)" alignItems="end">
                  <span className={styles.cartItemLabel}>
                    Total: ₹{item.totalPrice}/-
                  </span>
                  <span className={styles.cartItemValue}>
                    {state.searchParams.adults}{" "}
                    {state.searchParams.adults === 1 ? "Adult" : "Adults"}
                    {state.searchParams.children > 0 &&
                      `, ${state.searchParams.children} ${
                        state.searchParams.children === 1 ? "Child" : "Children"
                      }`}
                  </span>
                </Column>

                <div className={styles.actionButtons}>
                  <Button
                    variant="outline"
                    className={styles.editButton}
                    onClick={() => handleEdit(activity.id)}
                  >
                    <Edit2 size={18} /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    className={styles.removeButton}
                    onClick={() => handleRemove(activity.id)}
                  >
                    <Trash2 size={18} /> Remove
                  </Button>
                </div>
              </Row>
            </div>
          );
        })}
      </div>

      <Row
        justifyContent="between"
        alignItems="center"
        gap="var(--space-4)"
        fullWidth
        className={styles.cartFooter}
      >
        <Button
          variant="secondary"
          className={styles.addMoreButton}
          onClick={onAddMore}
          icon={<Plus size={16} />}
        >
          Add More
        </Button>

        <Button
          variant="primary"
          className={styles.nextButton}
          onClick={handleNext}
          icon={<ChevronRight size={16} />}
        >
          Next
        </Button>
      </Row>
    </div>
  );
};
