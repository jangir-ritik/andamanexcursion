"use client";
import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

// Register GSAP plugins
gsap.registerPlugin(MotionPathPlugin, ScrollTrigger);

export const SvgBackground: React.FC = () => {
  const riverRef = useRef<SVGSVGElement>(null);
  const boatRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!riverRef.current || !boatRef.current) return;

    const riverPath = riverRef.current.querySelector("path");
    if (!riverPath) return;

    // Wait for the next frame to ensure DOM is ready
    gsap.delayedCall(0.1, () => {
      // Create timeline for the boat animation
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: "body",
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          refreshPriority: -1, // Ensure this runs after layout calculations
        },
      });

      // Animate boat along the river path
      tl.to(boatRef.current, {
        duration: 1,
        ease: "none",
        motionPath: {
          path: riverPath,
          autoRotate: true,
          align: riverPath,
          alignOrigin: [0.5, 0.5],
          start: 1,
          end: 0,
        },
      });
    });

    // Cleanup function
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <>
      {/* River SVG Background */}
      <svg
        ref={riverRef}
        width="100%"
        height="100%"
        viewBox="0 0 1440 9274"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100%",
          minHeight: "100vh",
          zIndex: -1,
          pointerEvents: "none",
        }}
      >
        <path
          d="M38.0294 9271.51C57.2894 8739.52 1046.36 9193.69 1158.73 8793.85C1327.74 8192.5 462.009 8304.75 151.739 8169.5C-160.261 8033.5 -286.701 7420.05 -93.7106 7146.91C-18.6306 7040.65 181.739 6812.5 654.809 6823.78C870.359 6828.92 1034.4 6713.56 1068.74 6494.5C1100.03 6294.89 981.079 6117 804.739 6048.5C689.429 5997.47 501.759 6012.04 374.739 6044.5C201.949 6096.56 9.5894 6218.8 -143.541 6060.33C-290.411 5879.84 -348.261 5466.5 -154.261 5305.5C-71.3806 5236.72 52.7394 5133.5 310.739 5208.5C441.569 5246.53 582.359 5337.78 706.929 5287.56C773.939 5257.97 833.889 5177.21 808.889 5102.21C792.159 4997.11 634.879 4876.65 670.739 4754.5C702.739 4645.5 801.739 4584.5 940.739 4597.5C1111.77 4613.5 1340.08 4753.09 1486.21 4645.67C1591.76 4568.08 1592.7 4388.1 1498.99 4279.2C1446.56 4218.27 1380.57 4207.83 1311.91 4197.47C1240.98 4183.79 1101.83 4190.04 1015.85 4204.68C910.289 4222.65 794.929 4247.02 689.509 4219.45C606.329 4197.7 571.339 4109.77 611.299 4040.2C634.679 3999.48 689.509 3958.71 723.139 3933.81C806.529 3872.06 970.969 3822.9 1012.75 3705.5C1091.75 3483.5 901.749 3347.5 733.749 3386.5C608.489 3415.58 425.969 3500.71 296.749 3416.5C146.889 3318.84 112.309 3085.33 205.749 2935.5C316.749 2757.5 594.529 2915.06 762.749 2790.5C854.099 2725.51 975.239 2541.09 1084.75 2501.5C1305.57 2421.68 1533.75 2347.5 1481.45 2131.53C1441.84 1967.95 1322.75 1927.5 1211.67 1934.27C1091.77 1941.58 980.669 2004.17 865.749 2002.5C753.659 2000.88 668.169 1976.93 597.749 1889.5C525.099 1799.31 557.229 1656.21 657.139 1597.79C771.219 1531.08 912.189 1519.98 1049.12 1558.54C1154.13 1588.11 1267.86 1630.38 1376.68 1627.75C1457.58 1625.79 1513.4 1563.37 1548.76 1505.5C1599.87 1421.84 1509.04 1364.71 1520.76 1262.5C1531.18 1171.64 1537.65 1087.79 1487.24 1025.82C1485.88 1024.14 1482.94 1020.97 1481.46 1019.4C1316.42 845.22 1076.16 981.82 878.559 1006.79C693.229 1048.51 510.929 954.68 542.779 740.32C578.039 516.93 877.359 669.63 967.919 495.84C1013.8 391.82 965.509 268.96 869.169 212.01C671.829 108.51 177.019 201.23 133.599 -1.66016"
          stroke="#89B9FF"
          strokeWidth="1"
          strokeDasharray="12 10"
          strokeLinecap="round"
        />
      </svg>

      {/* Boat Element - positioned to follow the river */}
      <div
        ref={boatRef}
        style={{
          position: "absolute",
          width: "60px",
          height: "40px",
          zIndex: 0,
          transformOrigin: "center center",
          top: 0,
          left: 0,
        }}
      >
        {/* Boat SVG with proper orientation */}
        <svg
          width="60"
          height="40"
          viewBox="0 0 60 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Boat hull */}
          <path
            d="M5 25C5 25 15 30 30 30C45 30 55 25 55 25L50 20H10L5 25Z"
            fill="#8B4513"
            stroke="#654321"
            strokeWidth="1"
          />
          {/* Sail */}
          <path
            d="M30 5L30 22M25 8L35 8L30 5L25 8Z"
            stroke="#FFF"
            strokeWidth="2"
            fill="#FFF"
          />
          {/* Mast */}
          <line
            x1="30"
            y1="5"
            x2="30"
            y2="22"
            stroke="#8B4513"
            strokeWidth="2"
          />
          {/* Add a subtle glow effect */}
          <circle
            cx="30"
            cy="20"
            r="25"
            fill="rgba(255, 255, 255, 0.1)"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="1"
          />
        </svg>
      </div>
    </>
  );
};


// working code given by claude (with slight offset issues)