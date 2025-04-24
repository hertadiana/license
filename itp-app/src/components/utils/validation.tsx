
export const isValidPlate = (plate: string) =>
    /^[A-Z, 0-9]$/i.test(plate);
  
  export const isPositiveNumber = (value: string) =>
    /^\d+$/.test(value) && parseInt(value) > 0;
  
  export const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  
  export const isNonEmpty = (value: string) =>
    value.trim() !== '';
  