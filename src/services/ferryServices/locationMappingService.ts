/**
 * Centralized location mapping service for all ferry operators
 * Handles the complexity of different location formats across operators
 */

export interface LocationMapping {
  formValue: string;
  displayName: string;
  sealinkName: string;
  makruzzId: string;
  greenOceanId: number;
  aliases: string[];
}

/**
 * Master location mapping for all ferry operators
 * This is the single source of truth for location mappings
 */
export const LOCATION_MAPPINGS: Record<string, LocationMapping> = {
  "port-blair": {
    formValue: "port-blair",
    displayName: "Port Blair",
    sealinkName: "Port Blair",
    makruzzId: "1",
    greenOceanId: 1,
    aliases: ["Port Blair", "PB", "port-blair"],
  },
  havelock: {
    formValue: "havelock",
    displayName: "Havelock",
    sealinkName: "Swaraj Dweep",
    makruzzId: "2",
    greenOceanId: 2,
    aliases: ["Havelock", "Swaraj Dweep", "Havelock Island", "HL", "havelock"],
  },
  neil: {
    formValue: "neil",
    displayName: "Neil Island",
    sealinkName: "Shaheed Dweep",
    makruzzId: "3",
    greenOceanId: 3,
    aliases: ["Neil", "Shaheed Dweep", "Neil Island", "NL", "neil"],
  },
  baratang: {
    formValue: "baratang",
    displayName: "Baratang Island",
    sealinkName: "Baratang",
    makruzzId: "4",
    greenOceanId: 4, // Note: Green Ocean might not support Baratang
    aliases: ["Baratang", "Baratang Island", "BT", "baratang"],
  },
};

export class LocationMappingService {
  /**
   * Get Sealink location name from form value
   */
  static getSealinkLocation(formValue: string): string {
    const mapping = LOCATION_MAPPINGS[formValue];
    if (!mapping) {
      console.warn(`Unknown location for Sealink: ${formValue}`);
      return "Port Blair"; // Default fallback
    }
    console.log(`Sealink mapping: ${formValue} → "${mapping.sealinkName}"`);
    return mapping.sealinkName;
  }

  /**
   * Get Makruzz location ID from form value
   */
  static getMakruzzLocation(formValue: string): string {
    const mapping = LOCATION_MAPPINGS[formValue];
    if (!mapping) {
      console.warn(`Unknown location for Makruzz: ${formValue}`);
      return "1"; // Default to Port Blair
    }
    console.log(`Makruzz mapping: ${formValue} → "${mapping.makruzzId}"`);
    return mapping.makruzzId;
  }

  /**
   * Get Green Ocean location ID from form value
   */
  static getGreenOceanLocation(formValue: string): number {
    const mapping = LOCATION_MAPPINGS[formValue];
    if (!mapping) {
      console.warn(`Unknown location for Green Ocean: ${formValue}`);
      return 1; // Default to Port Blair
    }
    console.log(`Green Ocean mapping: ${formValue} → ${mapping.greenOceanId}`);
    return mapping.greenOceanId;
  }

  /**
   * Get display name from form value
   */
  static getDisplayName(formValue: string): string {
    const mapping = LOCATION_MAPPINGS[formValue];
    return mapping?.displayName || formValue;
  }

  /**
   * Get port code for a location
   */
  static getPortCode(formValue: string): string {
    const codeMap: Record<string, string> = {
      "port-blair": "PB",
      havelock: "HL",
      neil: "NL",
      baratang: "BT",
    };
    return codeMap[formValue] || "??";
  }

  /**
   * Validate if a route is supported by an operator
   */
  static isRouteSupported(
    operator: "sealink" | "makruzz" | "greenocean",
    from: string,
    to: string
  ): boolean {
    const fromMapping = LOCATION_MAPPINGS[from];
    const toMapping = LOCATION_MAPPINGS[to];

    if (!fromMapping || !toMapping) {
      return false;
    }

    // Special cases for operators that don't support certain routes
    if (
      operator === "greenocean" &&
      (from === "baratang" || to === "baratang")
    ) {
      return false; // Green Ocean doesn't go to Baratang
    }

    return true;
  }

  /**
   * Get all supported locations for the search form
   */
  static getFormLocations() {
    return Object.values(LOCATION_MAPPINGS).map((mapping) => ({
      value: mapping.formValue,
      label: mapping.displayName,
      id: mapping.formValue,
      name: mapping.displayName,
      slug: mapping.formValue,
    }));
  }

  /**
   * Debug method to show all mappings for a location
   */
  static debugLocation(formValue: string) {
    const mapping = LOCATION_MAPPINGS[formValue];
    if (!mapping) {
      console.log(`❌ Unknown location: ${formValue}`);
      return;
    }

    console.log(`🗺️  Location Debug: ${formValue}`);
    console.log(`   Display: "${mapping.displayName}"`);
    console.log(`   Sealink: "${mapping.sealinkName}"`);
    console.log(`   Makruzz: "${mapping.makruzzId}"`);
    console.log(`   Green Ocean: ${mapping.greenOceanId}`);
    console.log(`   Aliases: [${mapping.aliases.join(", ")}]`);
  }
}
