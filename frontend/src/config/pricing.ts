// Centralized frontend pricing rules/constants.
//
// Keep these values in one place so UI copy and checkout amounts stay consistent.

// Service fee model:
// - Base: (government fee * 2)
// - Markup: +5%
export const SERVICE_FEE_MULTIPLIER = 2;
export const SERVICE_FEE_MARKUP_RATE = 0.05;

// Express add-on increases the (service) fee by +15%.
export const EXPRESS_FEE_MARKUP_RATE = 0.15;

// Fallback used when currency conversion is not available.
export const FALLBACK_SERVICE_FEE_MNT = 350_000;

export const calculateServiceFee = (governmentFee: number): number => {
  if (!Number.isFinite(governmentFee) || governmentFee <= 0) return 0;
  return Math.round(governmentFee * SERVICE_FEE_MULTIPLIER * (1 + SERVICE_FEE_MARKUP_RATE));
};

export const calculateExpressServiceFee = (standardServiceFee: number): number => {
  if (!Number.isFinite(standardServiceFee) || standardServiceFee <= 0) return 0;
  return Math.round(standardServiceFee * (1 + EXPRESS_FEE_MARKUP_RATE));
};
