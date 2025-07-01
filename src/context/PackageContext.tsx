"use client";
import React, { createContext, useState, useContext, ReactNode } from "react";

interface PackageContextType {
  selectedPackage: string;
  selectedPeriod: string;
  setSelectedPackage: (packageId: string) => void;
  setSelectedPeriod: (periodId: string) => void;
}

const PackageContext = createContext<PackageContextType | undefined>(undefined);

export const PackageProvider = ({ children }: { children: ReactNode }) => {
  const [selectedPackage, setSelectedPackage] = useState("honeymoon");
  const [selectedPeriod, setSelectedPeriod] = useState("4-3");

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
