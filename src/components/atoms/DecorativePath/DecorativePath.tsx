import styles from "./DecorativePath.module.css";
import { cn } from "@/utils/cn";

interface DecorativePathProps {
  pathData: string;
  showBoat?: boolean;
  boatPosition?: number;
  className?: string;
}

export default function DecorativePath({
  pathData,
  showBoat = true,
  boatPosition = 0.5,
  className = "",
}: DecorativePathProps) {
  const boatX = boatPosition * 100;
  const boatY = 0;

  return (
    <svg
      className={cn(styles.decorativePath, className)}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100vw",
        height: "auto", // Changed from 100% to auto
        minHeight: "100vh",
        zIndex: -1,
        pointerEvents: "none",
      }}
      width="100%"
      height="100%"
      viewBox="0 0 1440 9274"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
    >
      <path
        d={pathData}
        stroke="var(--color-testimonial-blue)"
        strokeWidth="1"
        strokeDasharray="12,10"
        fill="none"
      />
      {showBoat && (
        <g>
          <use href="#boat-icon" transform={`translate(${boatX}, ${boatY})`} />
        </g>
      )}
    </svg>
  );
}
