import React, { useMemo, useState } from 'react';
import { Star } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface ReviewSectionProps { productId: string; }

export const ReviewSection: React.FC<ReviewSectionProps> = ({ productId }) => {
  const { reviews, addReview, currentUser } = useStore();
  const [isFormOpen, setFormOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const productReviews = reviews.filter((review) => review.productId === productId);
  const average = useMemo(() => productReviews.length ? productReviews.reduce((sum, review) => sum + review.rating, 0) / productReviews.length : 0, [productReviews]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !body.trim()) return;
    addReview({ productId, author: currentUser?.name || 'Guest shopper', rating, title: title.trim(), body: body.trim() });
    setTitle('');
    setBody('');
    setRating(5);
    setFormOpen(false);
  };

  return (
    <section className="border border-[#2D2D35] bg-[#1A1A1E] p-5 sm:p-6" aria-labelledby="customer-reviews-title">
      <div className="flex flex-col gap-4 border-b border-[#2D2D35] pb-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#C9A84C]">Verified community</p><h2 id="customer-reviews-title" className="font-display-hero text-2xl text-[#FAF9F5]">Customer reviews</h2></div><div className="flex items-center gap-3"><span className="font-mono text-2xl font-bold text-[#FAF9F5]">{average ? average.toFixed(1) : '—'}</span><span className="text-xs text-[#8E8D94]">from {productReviews.length} demo reviews</span><button id="open-review-form" type="button" onClick={() => setFormOpen((open) => !open)} className="min-h-11 border border-[#C9A84C] px-3 font-mono text-[10px] font-bold uppercase text-[#C9A84C] hover:bg-[#C9A84C] hover:text-[#0E0E10]">Write review</button></div></div>
      {isFormOpen && <form onSubmit={submit} className="mt-5 grid gap-4 border border-[#3E3E47] bg-[#141417] p-4 sm:grid-cols-2"><label className="font-mono text-[10px] uppercase tracking-wider text-[#8E8D94]">Your rating <span className="mt-2 flex gap-1">{[1,2,3,4,5].map((value) => <button id={`review-rating-${value}`} key={value} type="button" onClick={() => setRating(value)} aria-label={`${value} stars`} className={value <= rating ? 'text-[#C9A84C]' : 'text-[#3E3E47]'}><Star className="h-5 w-5 fill-current" /></button>)}</span></label><label className="font-mono text-[10px] uppercase tracking-wider text-[#8E8D94]">Review title<input id="review-title" required value={title} onChange={(event) => setTitle(event.target.value)} className="mt-2 w-full border border-[#3E3E47] bg-[#0E0E10] p-2 text-sm text-[#FAF9F5] outline-none focus:border-[#C9A84C]" /></label><label className="sm:col-span-2 font-mono text-[10px] uppercase tracking-wider text-[#8E8D94]">Your review<textarea id="review-body" required rows={3} value={body} onChange={(event) => setBody(event.target.value)} className="mt-2 w-full border border-[#3E3E47] bg-[#0E0E10] p-2 text-sm text-[#FAF9F5] outline-none focus:border-[#C9A84C]" /></label><div className="sm:col-span-2 flex justify-end gap-2"><button id="cancel-review" type="button" onClick={() => setFormOpen(false)} className="min-h-10 px-3 font-mono text-xs uppercase text-[#8E8D94]">Cancel</button><button id="submit-review" type="submit" className="min-h-10 bg-[#C9A84C] px-4 font-mono text-xs font-bold uppercase text-[#0E0E10]">Publish demo review</button></div></form>}
      <div className="mt-5 space-y-3">{productReviews.length === 0 ? <p className="text-sm text-[#8E8D94]">Be the first to review this selection.</p> : productReviews.map((review) => <article key={review.id} className="border-b border-[#2D2D35] pb-4 last:border-0"><div className="flex flex-wrap items-center justify-between gap-2"><div><span className="font-semibold text-[#FAF9F5]">{review.author}</span>{review.verifiedPurchase && <span className="ml-2 border border-[#22C55E]/30 bg-[#22C55E]/10 px-1.5 py-0.5 font-mono text-[9px] uppercase text-[#22C55E]">Verified purchase</span>}</div><span className="text-[11px] text-[#8E8D94]">{new Date(review.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span></div><div className="mt-2 flex text-[#C9A84C]">{Array.from({ length: 5 }, (_, index) => <Star key={index} className={`h-3.5 w-3.5 ${index < review.rating ? 'fill-current' : ''}`} />)}</div><h3 className="mt-2 font-medium text-[#FAF9F5]">{review.title}</h3><p className="mt-1 text-sm leading-relaxed text-[#C5C7C9]">{review.body}</p></article>)}</div>
    </section>
  );
};
