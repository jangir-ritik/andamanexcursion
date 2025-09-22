// Form-related constants

export const COUNTRIES = [
  { value: "Indian", label: "Indian" },
  { value: "American", label: "American" },
  { value: "British", label: "British" },
  { value: "Canadian", label: "Canadian" },
  { value: "Australian", label: "Australian" },
  { value: "German", label: "German" },
  { value: "French", label: "French" },
  { value: "Italian", label: "Italian" },
  { value: "Spanish", label: "Spanish" },
  { value: "Japanese", label: "Japanese" },
  { value: "Chinese", label: "Chinese" },
  { value: "South Korean", label: "South Korean" },
  { value: "Singapore", label: "Singapore" },
  { value: "Malaysian", label: "Malaysian" },
  { value: "Thai", label: "Thai" },
  { value: "Indonesian", label: "Indonesian" },
  { value: "Filipino", label: "Filipino" },
  { value: "Vietnamese", label: "Vietnamese" },
  { value: "Dutch", label: "Dutch" },
  { value: "Belgian", label: "Belgian" },
  { value: "Swiss", label: "Swiss" },
  { value: "Austrian", label: "Austrian" },
  { value: "Swedish", label: "Swedish" },
  { value: "Norwegian", label: "Norwegian" },
  { value: "Danish", label: "Danish" },
  { value: "Finnish", label: "Finnish" },
  { value: "Russian", label: "Russian" },
  { value: "Brazilian", label: "Brazilian" },
  { value: "Argentine", label: "Argentine" },
  { value: "Chilean", label: "Chilean" },
  { value: "Mexican", label: "Mexican" },
  { value: "South African", label: "South African" },
  { value: "Egyptian", label: "Egyptian" },
  { value: "Emirati", label: "Emirati" },
  { value: "Saudi", label: "Saudi" },
  { value: "Israeli", label: "Israeli" },
  { value: "Turkish", label: "Turkish" },
  { value: "Greek", label: "Greek" },
  { value: "Portuguese", label: "Portuguese" },
  { value: "Irish", label: "Irish" },
  { value: "New Zealand", label: "New Zealand" },
];

export const GENDER_OPTIONS = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" },
];

export const SPECIAL_OCCASIONS = [
  { id: "honeymoon", label: "Honeymoon" },
  { id: "birthday", label: "Birthday" },
  { id: "anniversary", label: "Anniversary" },
  { id: "solo", label: "Solo Trip" },
  { id: "other", label: "Other" },
] as const;

// Nationality mapping for API consistency
export const NATIONALITY_MAPPING = {
  "Indian": {
    api: "indian", // For Makruzz API (lowercase)
    display: "Indian",
    isIndian: true,
  },
  "American": {
    api: "foreigner",
    display: "American", 
    isIndian: false,
  },
  // Add more mappings as needed
} as const;

// Gender mapping for different APIs
export const GENDER_MAPPING = {
  "Male": {
    sealink: "M",
    makruzz: "male",
    greenocean: "Male",
    display: "Male",
  },
  "Female": {
    sealink: "F", 
    makruzz: "female",
    greenocean: "Female",
    display: "Female",
  },
  "Other": {
    sealink: "M", // Fallback
    makruzz: "male", // Fallback
    greenocean: "Male", // Fallback
    display: "Other",
  },
} as const;

// Title mapping based on gender
export const TITLE_MAPPING = {
  "Male": "MR",
  "Female": "MRS", 
  "Other": "MR", // Fallback
} as const;
