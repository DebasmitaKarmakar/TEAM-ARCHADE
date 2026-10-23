/**
 * Shipment grouping rules — edit this to change how one cart splits into deliveries.
 * Adding a 7th department = add its slug to one of the groups.
 */
export interface ShipmentRule {
  group: string;
  label: string;
  departments: string[];
  etaDays: number;
  needsSlot?: boolean;
}

export const SHIPMENT_RULES: ShipmentRule[] = [
  { group: 'general', label: 'Fashion, Beauty, Home & Kids', departments: ['fashion', 'beauty', 'home', 'kids'], etaDays: 3 },
  { group: 'electronics', label: 'Electronics', departments: ['electronics'], etaDays: 2 },
  { group: 'grocery', label: 'Grocery (slot delivery)', departments: ['grocery'], etaDays: 1, needsSlot: true },
];

export const FALLBACK_RULE: ShipmentRule = SHIPMENT_RULES[0];

export function ruleForDepartment(slug: string): ShipmentRule {
  return SHIPMENT_RULES.find((r) => r.departments.includes(slug)) ?? FALLBACK_RULE;
}
