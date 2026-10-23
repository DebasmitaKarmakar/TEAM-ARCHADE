/** Shipment grouping rules — change grouping by editing this config */
export interface ShipmentRule {
  group: string;
  departments: string[];
  etaDays: number;
  needsSlot?: boolean;
}

export const SHIPMENT_RULES: ShipmentRule[] = [
  { group: 'grocery',     departments: ['grocery'],                          etaDays: 0, needsSlot: true },
  { group: 'electronics', departments: ['electronics'],                      etaDays: 2 },
  { group: 'general',     departments: ['fashion', 'beauty', 'home', 'kids'], etaDays: 3 },
];

/**
 * Group cart lines by shipment rule.
 * Returns non-empty groups with their ETAs.
 */
export function groupShipments<T extends { departmentSlug: string }>(
  lines: T[]
): { group: string; etaDays: number; needsSlot: boolean; items: T[] }[] {
  const grouped: Record<string, { group: string; etaDays: number; needsSlot: boolean; items: T[] }> = {};

  for (const line of lines) {
    const rule = SHIPMENT_RULES.find(r => r.departments.includes(line.departmentSlug));
    if (!rule) continue;

    if (!grouped[rule.group]) {
      grouped[rule.group] = {
        group: rule.group,
        etaDays: rule.etaDays,
        needsSlot: rule.needsSlot ?? false,
        items: [],
      };
    }
    grouped[rule.group].items.push(line);
  }

  return Object.values(grouped).filter(g => g.items.length > 0);
}
