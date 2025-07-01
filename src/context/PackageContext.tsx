"use client";
import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";

interface PackageContextType {
  selectedPackage: string;
  selectedPeriod: string;
  setSelectedPackage: (packageId: string) => void;
  setSelectedPeriod: (periodId: string) => void;
}

const PackageContext = createContext<PackageContextType | undefined>(undefined);

export const PackageProvider = ({ children }: { children: ReactNode }) => {
  // Initialize state from localStorage if available, otherwise use defaults
  const [selectedPackage, setSelectedPackageState] = useState<string>(() => {
    // This code runs only on the client side
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("selectedPackage");
      return saved || "honeymoon";
    }
    return "honeymoon";
  });

  const [selectedPeriod, setSelectedPeriodState] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("selectedPeriod");
      return saved || "4-3";
    }
    return "4-3";
  });

  // Save to localStorage when state changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedPackage", selectedPackage);
    }
  }, [selectedPackage]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedPeriod", selectedPeriod);
    }
  }, [selectedPeriod]);

  // Wrapper functions to update state
  const setSelectedPackage = (packageId: string) => {
    setSelectedPackageState(packageId);
  };

  const setSelectedPeriod = (periodId: string) => {
    setSelectedPeriodState(periodId);
  };

  return (
    <PackageContext.Provider
      value={{
        selectedPackage,
        selectedPeriod,
        setSelectedPackage,
        setSelectedPeriod,
      }}
    >
      {children}
    </PackageContext.Provider>
  );
};

export const usePackageContext = () => {
  const context = useContext(PackageContext);
  if (context === undefined) {
    throw new Error("usePackageContext must be used within a PackageProvider");
  }
  return context;
};
