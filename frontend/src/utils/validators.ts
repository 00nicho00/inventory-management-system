export function validateSku(sku: string): string | null {
  if (!sku || !sku.trim()) return 'SKU is required.';
  if (sku.length < 3) return 'SKU must be at least 3 characters.';
  if (!/^[A-Za-z0-9-_]+$/.test(sku)) {
    return 'SKU can only contain letters, numbers, hyphens, and underscores.';
  }
  return null;
}

export function validateRequired(value: string, fieldName = 'This field'): string | null {
  if (!value || !value.trim()) return `${fieldName} is required.`;
  return null;
}

export function validatePositiveNumber(value: number, fieldName = 'Amount'): string | null {
  if (isNaN(value) || value < 0) return `${fieldName} must be a non-negative number.`;
  return null;
}

export function validateIntegerGreaterThanZero(value: number, fieldName = 'Quantity'): string | null {
  if (isNaN(value) || !Number.isInteger(value) || value <= 0) {
    return `${fieldName} must be an integer greater than 0.`;
  }
  return null;
}
