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
  // Initialize with safe default values for SSR
  const [selectedPackage, setSelectedPackageState] = useState<string>("all");
  const [selectedPeriod, setSelectedPeriodState] = useState<string>("all");
  // Track if we've hydrated
  const [isHydrated, setIsHydrated] = useState(false);

  // Only after hydration, load values from localStorage
  useEffect(() => {
    // This effect will only run on the client after hydration
    const savedPackage = localStorage.getItem("selectedPackage");
    const savedPeriod = localStorage.getItem("selectedPeriod");

    if (savedPackage) setSelectedPackageState(savedPackage);
    if (savedPeriod) setSelectedPeriodState(savedPeriod);

    setIsHydrated(true);
  }, []);

  // Save to localStorage when state changes, but only after hydration
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("selectedPackage", selectedPackage);
    }
  }, [selectedPackage, isHydrated]);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("selectedPeriod", selectedPeriod);
    }
  }, [selectedPeriod, isHydrated]);

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
