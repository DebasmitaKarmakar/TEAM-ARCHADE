import React, { useEffect, useState } from 'react';

const INTRO_KEY = 'blowmaggy-intro-seen';
export const INTRO_ENABLED = true;
const LETTERS = 'BLOWMAGGY'.split('');

export const BlowmaggyIntro: React.FC = () => {
  const [visible, setVisible] = useState(() => INTRO_ENABLED && sessionStorage.getItem(INTRO_KEY) !== 'true');
  const [reducedMotion, setReducedMotion] = useState(false);
  const finish = () => { sessionStorage.setItem(INTRO_KEY, 'true'); setVisible(false); };

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(media.matches);
    if (!visible) return;
    const timer = window.setTimeout(finish, media.matches ? 350 : 2850);
    return () => window.clearTimeout(timer);
  }, [visible]);

  if (!visible) return null;
  return <section className={`bm-intro ${reducedMotion ? 'bm-intro--reduced' : ''}`} aria-label="BLOWMAGGY introduction">
    <button className="bm-intro__skip" type="button" onClick={finish}>Skip intro <span aria-hidden="true">→</span></button>
    <div className="bm-intro__halo" />
    <div className="bm-intro__content">
      <p className="bm-intro__eyebrow">The universal department store</p>
      <h1 className="bm-intro__word" aria-label="BLOWMAGGY">{LETTERS.map((letter, index) => <span key={`${letter}-${index}`} style={{ animationDelay: `${220 + index * 95}ms` }}>{letter}</span>)}</h1>
      <p className="bm-intro__credit">Developed by Himanshu Yadav and Debasmita Karmakar</p>
      <article className="bm-intro__card"><span>Every department.</span><strong>One cart. One checkout.</strong><i /></article>
    </div>
  </section>;
};
