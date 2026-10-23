import { Review } from '../types/store';

export const INITIAL_REVIEWS: Review[] = [
  { id: 'review-1', productId: 'prod-aura-anc', author: 'Ananya Rao', rating: 5, title: 'Quiet, weightless, precise', body: 'The detail is extraordinary and the all-day fit feels genuinely considered.', createdAt: '2026-10-18', verifiedPurchase: true },
  { id: 'review-2', productId: 'prod-aura-anc', author: 'Karan Mehta', rating: 4, title: 'Beautiful studio companion', body: 'Excellent isolation and an unexpectedly refined finish.', createdAt: '2026-10-09', verifiedPurchase: true },
  { id: 'review-3', productId: 'prod-night-serum', author: 'Mira Shah', rating: 5, title: 'A calm morning-after ritual', body: 'Absorbs quickly and leaves a soft, healthy finish by morning.', createdAt: '2026-10-14', verifiedPurchase: true },
  { id: 'review-4', productId: 'prod-wool-coat', author: 'Dev Kapoor', rating: 5, title: 'Tailoring with real structure', body: 'The shoulder and drape make it feel far more expensive than expected.', createdAt: '2026-10-03', verifiedPurchase: true },
];
