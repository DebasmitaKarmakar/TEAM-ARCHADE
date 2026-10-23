import React, { useState } from 'react';
import { MAGAZINE_CHAPTERS } from '../data/magazineContent';
import { useStore } from '../context/StoreContext';
import {
  BookOpen,
  ArrowLeft,
  ArrowRight,
  Bookmark,
  CheckCircle2,
  Share2,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';

export const EverythingIssueMagazine: React.FC = () => {
  const { setActiveView } = useStore();
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);

  const currentChapter = MAGAZINE_CHAPTERS[activeChapterIndex];

  return (
    <div className="min-h-screen bg-[#0E0E10] text-[#E8E8E8] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between text-xs font-mono text-[#8E8D94] uppercase tracking-wider mb-6 pb-4 border-b border-[#2D2D35]">
          <button
            onClick={() => setActiveView('home')}
            className="hover:text-[#FAF9F5] flex items-center gap-1 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Storefront
          </button>
          <div className="flex items-center gap-3">
            <span className="text-[#C9A84C] font-semibold">Vol. 01 | Vibe Coding Competition 2026</span>
          </div>
        </div>

        {/* Magazine Masthead Header */}
        <div className="text-center py-8 border-b border-[#2D2D35] mb-10">
          <div className="inline-block text-[11px] font-mono uppercase tracking-[0.3em] text-[#C9A84C] border border-[#C9A84C]/40 px-3 py-1 mb-3">
            The Everything Issue — Official Monograph
          </div>
          <h1 className="font-display-hero text-4xl sm:text-6xl text-[#FAF9F5] tracking-tight">
            BLOWMAGGY
          </h1>
          <p className="font-sans text-sm sm:text-base text-[#8E8D94] max-w-2xl mx-auto mt-2">
            A multi-departmental store, fully functional and built end-to-end. Fashion, beauty, electronics, home and living, grocery, and kids and toys — all under one roof, with one cart and one checkout.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-6 text-xs font-mono text-[#8E8D94]">
            <span>10 Core Chapters</span>
            <span>•</span>
            <span>Full PRD & Data Model</span>
            <span>•</span>
            <span>7 Security Threat Defenses</span>
            <span>•</span>
            <span>Live System Demo</span>
          </div>
        </div>

        {/* Magazine Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Table of Contents (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-[#1A1A1E] border border-[#2D2D35] p-5 sticky top-24">
              <div className="flex items-center gap-2 pb-3 mb-3 border-b border-[#2D2D35] text-xs font-mono uppercase tracking-wider text-[#FAF9F5] font-semibold">
                <BookOpen className="w-4 h-4 text-[#C9A84C]" />
                <span>Issue Table of Contents</span>
              </div>

              <div className="space-y-1.5 max-h-[calc(100vh-200px)] overflow-y-auto pr-1">
                {MAGAZINE_CHAPTERS.map((ch, idx) => {
                  const isActive = idx === activeChapterIndex;
                  return (
                    <button
                      key={ch.id}
                      onClick={() => {
                        setActiveChapterIndex(idx);
                        window.scrollTo({ top: 200, behavior: 'smooth' });
                      }}
                      className={`w-full text-left p-2.5 transition-all flex items-start gap-3 cursor-pointer ${
                        isActive
                          ? 'bg-[#C9A84C]/15 border-l-2 border-[#C9A84C] text-[#FAF9F5]'
                          : 'border-l-2 border-transparent text-[#8E8D94] hover:text-[#FAF9F5] hover:bg-[#141417]'
                      }`}
                    >
                      <span className="font-mono text-xs text-[#C9A84C] font-bold mt-0.5">
                        {ch.number}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-sans font-medium text-xs truncate">
                          {ch.title.replace(/^\d+\.\s*/, '')}
                        </div>
                        <div className="text-[10px] text-[#8E8D94] truncate">{ch.subtitle}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Direct Link to Launch Store */}
              <div className="pt-4 mt-4 border-t border-[#2D2D35]">
                <button
                  onClick={() => setActiveView('home')}
                  className="w-full bg-[#C9A84C] hover:bg-[#d6b75e] text-[#0E0E10] py-2.5 font-mono text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Explore Live Storefront</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Chapter Reader (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-[#1A1A1E] border border-[#2D2D35] p-6 sm:p-10">
              {/* Chapter Header */}
              <div className="pb-6 mb-6 border-b border-[#2D2D35]">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[#C9A84C] mb-2">
                  <span>CHAPTER {currentChapter.number}</span>
                  <span>•</span>
                  <span>THE EVERYTHING ISSUE</span>
                </div>
                <h2 className="font-display-hero text-2xl sm:text-3xl text-[#FAF9F5]">
                  {currentChapter.title}
                </h2>
                <p className="text-sm font-sans text-[#8E8D94] mt-2 leading-relaxed">
                  {currentChapter.subtitle}
                </p>
              </div>

              {/* Key Takeaways Card */}
              {currentChapter.keyPoints && currentChapter.keyPoints.length > 0 && (
                <div className="bg-[#141417] border border-[#2D2D35] p-5 mb-8">
                  <div className="text-xs font-mono uppercase tracking-wider text-[#C9A84C] font-semibold mb-3 flex items-center gap-2">
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Executive Takeaways</span>
                  </div>
                  <ul className="space-y-2 text-xs font-sans text-[#E8E8E8]">
                    {currentChapter.keyPoints.map((pt, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[#22C55E] flex-shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Chapter Body Markdown-like Renderer */}
              <div className="prose prose-invert max-w-none font-sans text-sm leading-relaxed text-[#D0CFD6] space-y-4">
                {currentChapter.content
                  .trim()
                  .split('\n\n')
                  .map((paragraph, pIdx) => {
                    const trimmed = paragraph.trim();

                    // Heading 1
                    if (trimmed.startsWith('# ')) {
                      return (
                        <h2
                          key={pIdx}
                          className="font-display-hero text-2xl text-[#FAF9F5] pt-4 pb-2 border-b border-[#2D2D35]"
                        >
                          {trimmed.replace('# ', '')}
                        </h2>
                      );
                    }

                    // Heading 2
                    if (trimmed.startsWith('## ')) {
                      return (
                        <h3
                          key={pIdx}
                          className="font-mono text-base uppercase text-[#C9A84C] font-semibold pt-4"
                        >
                          {trimmed.replace('## ', '')}
                        </h3>
                      );
                    }

                    // Heading 3
                    if (trimmed.startsWith('### ')) {
                      return (
                        <h4
                          key={pIdx}
                          className="font-mono text-sm uppercase text-[#FAF9F5] font-semibold pt-2"
                        >
                          {trimmed.replace('### ', '')}
                        </h4>
                      );
                    }

                    // Code block
                    if (trimmed.startsWith('```')) {
                      const cleanCode = trimmed.replace(/```[a-z]*\n?/g, '').replace(/```/g, '');
                      return (
                        <pre
                          key={pIdx}
                          className="bg-[#141417] border border-[#2D2D35] p-4 font-mono text-xs text-[#FAF9F5] overflow-x-auto my-3"
                        >
                          <code>{cleanCode}</code>
                        </pre>
                      );
                    }

                    // Bullet lists
                    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                      const lines = trimmed.split('\n');
                      return (
                        <ul key={pIdx} className="space-y-1.5 pl-4 list-disc text-xs sm:text-sm">
                          {lines.map((line, lIdx) => {
                            const lineContent = line.replace(/^[-*]\s*/, '');
                            return <li key={lIdx} dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(lineContent) }} />;
                          })}
                        </ul>
                      );
                    }

                    // Numbered lists
                    if (/^\d+\.\s/.test(trimmed)) {
                      const lines = trimmed.split('\n');
                      return (
                        <ol key={pIdx} className="space-y-1.5 pl-4 list-decimal text-xs sm:text-sm">
                          {lines.map((line, lIdx) => {
                            const lineContent = line.replace(/^\d+\.\s*/, '');
                            return <li key={lIdx} dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(lineContent) }} />;
                          })}
                        </ol>
                      );
                    }

                    // Standard paragraph
                    return (
                      <p
                        key={pIdx}
                        className="text-xs sm:text-sm leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(trimmed) }}
                      />
                    );
                  })}
              </div>

              {/* Prev / Next Footer Stepper */}
              <div className="mt-12 pt-6 border-t border-[#2D2D35] flex items-center justify-between">
                {activeChapterIndex > 0 ? (
                  <button
                    onClick={() => {
                      setActiveChapterIndex((prev) => prev - 1);
                      window.scrollTo({ top: 200, behavior: 'smooth' });
                    }}
                    className="flex items-center gap-2 text-xs font-mono uppercase text-[#8E8D94] hover:text-[#FAF9F5] transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Previous: Chapter {MAGAZINE_CHAPTERS[activeChapterIndex - 1].number}</span>
                  </button>
                ) : (
                  <div></div>
                )}

                {activeChapterIndex < MAGAZINE_CHAPTERS.length - 1 ? (
                  <button
                    onClick={() => {
                      setActiveChapterIndex((prev) => prev + 1);
                      window.scrollTo({ top: 200, behavior: 'smooth' });
                    }}
                    className="flex items-center gap-2 text-xs font-mono uppercase text-[#C9A84C] hover:text-[#d6b75e] font-semibold transition-colors cursor-pointer"
                  >
                    <span>Next: Chapter {MAGAZINE_CHAPTERS[activeChapterIndex + 1].number}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveView('home')}
                    className="flex items-center gap-2 text-xs font-mono uppercase text-[#C9A84C] hover:text-[#d6b75e] font-semibold transition-colors cursor-pointer"
                  >
                    <span>Return to Storefront</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function formatInlineMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#FAF9F5]">$1</strong>')
    .replace(/`(.*?)`/g, '<code class="bg-[#141417] px-1 py-0.5 border border-[#2D2D35] text-[#C9A84C] font-mono text-[11px]">$1</code>');
}
