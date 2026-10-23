/** "Shop by mood" cards per department → each maps to a product tag (GET /products?dept=…&tag=…). */
export const DEPARTMENT_MOODS: Record<string, { label: string; tag: string }[]> = {
  fashion: [{ label: 'Festive', tag: 'festive' }, { label: 'Office', tag: 'office' }, { label: 'Weekend', tag: 'weekend' }, { label: 'Gym', tag: 'gym' }],
  beauty: [{ label: 'Everyday', tag: 'everyday' }, { label: 'Party', tag: 'party' }, { label: 'Self-care', tag: 'self-care' }, { label: 'Gifting', tag: 'gifting' }],
  electronics: [{ label: 'Work from home', tag: 'wfh' }, { label: 'Fitness', tag: 'fitness' }, { label: 'Travel', tag: 'travel' }, { label: 'Party', tag: 'party' }],
  home: [{ label: 'Cosy', tag: 'cosy' }, { label: 'Minimal', tag: 'minimal' }, { label: 'Festive', tag: 'festive' }, { label: 'Kitchen', tag: 'kitchen' }],
  grocery: [{ label: 'Breakfast', tag: 'breakfast' }, { label: 'Healthy', tag: 'healthy' }, { label: 'Party snacks', tag: 'party-snacks' }, { label: 'Monthly stock-up', tag: 'monthly' }],
  kids: [{ label: '0–2 yrs', tag: '0-2' }, { label: '3–5 yrs', tag: '3-5' }, { label: '6–9 yrs', tag: '6-9' }, { label: '10+', tag: '10+' }],
};
