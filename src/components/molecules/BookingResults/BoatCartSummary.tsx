"use client";
import React from "react";
import { Button } from "@/components/atoms";
import { type BoatCartItem } from "@/store/BoatStore";
import styles from "./CartSummary.module.css";

interface BoatCartSummaryProps {
  cart: BoatCartItem[];
  onAddMore: () => void;
  onCheckout: () => void;
}

export const BoatCartSummary: React.FC<BoatCartSummaryProps> = ({
  cart,
  onAddMore,
  onCheckout,
}) => {
  const totalPrice = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const totalPassengers = cart.reduce(
    (sum, item) => sum + item.searchParams.adults + item.searchParams.children,
    0
  );

  return (
    <div className={styles.cartSummary}>
      <div className={styles.cartHeader}>
        <h3 className={styles.cartTitle}>Your Boat Trips</h3>
        <span className={styles.cartCount}>
          {cart.length} trip{cart.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className={styles.cartItems}>
        {cart.map((item) => (
          <div key={item.id} className={styles.cartItem}>
            <div className={styles.itemInfo}>
              <h4 className={styles.itemTitle}>{item.boat.name}</h4>
              <p className={styles.itemRoute}>
                {item.boat.route.from} → {item.boat.route.to}
              </p>
              <div className={styles.itemDetails}>
                <span className={styles.itemDate}>
                  📅 {new Date(item.searchParams.date).toLocaleDateString()}
                </span>
                <span className={styles.itemTime}>🕒 {item.selectedTime}</span>
                <span className={styles.itemPassengers}>
                  👥 {item.searchParams.adults + item.searchParams.children}{" "}
                  passengers
                </span>
              </div>
            </div>
            <div className={styles.itemPrice}>
              <strong>₹{item.totalPrice}</strong>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.cartSummaryFooter}>
        <div className={styles.totalSection}>
          <div className={styles.totalRow}>
            <span>Total Passengers:</span>
            <span>{totalPassengers}</span>
          </div>
          <div className={styles.totalRow}>
            <span>
              <strong>Total Amount:</strong>
            </span>
            <span>
              <strong>₹{totalPrice}</strong>
            </span>
          </div>
        </div>

        <div className={styles.cartActions}>
          <Button
            variant="secondary"
            size="small"
            onClick={onAddMore}
            className={styles.addMoreButton}
          >
            Add More Trips
          </Button>
          <Button
            variant="primary"
            size="medium"
            onClick={onCheckout}
            className={styles.checkoutButton}
            showArrow
          >
            Proceed to Checkout
          </Button>
        </div>
      </div>
    </div>
  );
};
