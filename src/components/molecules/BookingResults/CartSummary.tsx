import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/atoms";
import { useActivity } from "@/store/ActivityStore";
import styles from "./CartSummary.module.css";
import { Row } from "@/components/layout";
import {
  Plus,
  ChevronRight,
  Edit2,
  Trash2,
  Calendar,
  MapPin,
  Clock,
  Users,
} from "lucide-react";

interface CartSummaryProps {
  className?: string;
  onAddMore?: () => void;
}

export const CartSummary: React.FC<CartSummaryProps> = ({
  className,
  onAddMore,
}) => {
  const router = useRouter();
  const { state, removeFromCart, startEditingItem } = useActivity();
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
      return `${displayHours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
    }
    return timeString;
  };

  const handleRemove = (cartItemId: string) => {
    removeFromCart(cartItemId);
  };

  const handleEdit = (cartItemId: string) => {
    // Start editing mode for the specific cart item
    startEditingItem(cartItemId);

    // Scroll to the form to show the populated data
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

  const totalAmount = cart.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <div className={className}>
      <div className={styles.cartContainer}>
        <div className={styles.header}>
          <h3 className={styles.title}>Your Selection</h3>
          {onAddMore && (
            <Button
              variant="outline"
              className={styles.addMoreButton}
              onClick={onAddMore}
            >
              <Plus size={16} />
              Add More
            </Button>
          )}
        </div>

        <div className={styles.cartItems}>
          {cart.map((item) => {
            const activity = item.activity;
            const searchParams = item.searchParams;
            const isEditing = state.editingItemId === item.id;

            return (
              <div
                key={item.id}
                className={`${styles.cartItem} ${
                  isEditing ? styles.editing : ""
                }`}
              >
                <Row gap="var(--space-4)" alignItems="start">
                  <div className={styles.cartItemImage}>
                    <img
                      src={
                        activity.media.featuredImage?.url ||
                        "/images/placeholder.png"
                      }
                      alt={activity.title}
                      className={styles.activityImage}
                    />
                  </div>

                  <div className={styles.cartItemInfo}>
                    <h4 className={styles.cartItemTitle}>{activity.title}</h4>

                    <div className={styles.cartItemDetails}>
                      <Calendar size={14} />
                      <span>{formatDate(searchParams.date)}</span>
                    </div>

                    <div className={styles.cartItemDetails}>
                      <Clock size={14} />
                      <span>{formatTime(searchParams.time)}</span>
                    </div>

                    <div className={styles.cartItemDetails}>
                      <MapPin size={14} />
                      <span>
                        {activity.coreInfo.location[0]?.name ||
                          "Unknown Location"}
                      </span>
                    </div>

                    <div className={styles.cartItemDetails}>
                      <Users size={14} />
                      <span>
                        {searchParams.adults}{" "}
                        {searchParams.adults === 1 ? "Adult" : "Adults"}
                        {searchParams.children > 0 &&
                          `, ${searchParams.children} ${
                            searchParams.children === 1 ? "Child" : "Children"
                          }`}
                        {searchParams.infants > 0 &&
                          `, ${searchParams.infants} ${
                            searchParams.infants === 1 ? "Infant" : "Infants"
                          }`}
                      </span>
                    </div>

                    {item.activityOptionId && (
                      <div className={styles.cartItemOption}>
                        {activity.activityOptions.find(
                          (opt) => opt.id === item.activityOptionId
                        )?.optionTitle || "Standard Option"}
                      </div>
                    )}
                  </div>

                  <div className={styles.cartItemPricing}>
                    <span className={styles.cartItemLabel}>
                      ₹{item.totalPrice}/-
                    </span>
                    <span className={styles.cartItemValue}>
                      Qty: {item.quantity}
                    </span>
                  </div>

                  <div className={styles.actionButtons}>
                    <Button
                      variant="outline"
                      className={styles.editButton}
                      onClick={() => handleEdit(item.id)}
                    >
                      <Edit2 size={14} />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      className={styles.removeButton}
                      onClick={() => handleRemove(item.id)}
                    >
                      <Trash2 size={14} />
                      Remove
                    </Button>
                  </div>
                </Row>
              </div>
            );
          })}
        </div>

        <div className={styles.cartSummary}>
          <Row justifyContent="between" alignItems="center">
            <span className={styles.totalLabel}>Total Amount:</span>
            <span className={styles.totalAmount}>₹{totalAmount}/-</span>
          </Row>
        </div>

        <div className={styles.actionSection}>
          <Button
            variant="primary"
            className={styles.nextButton}
            onClick={handleNext}
          >
            Continue to Checkout
            <ChevronRight size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
};
