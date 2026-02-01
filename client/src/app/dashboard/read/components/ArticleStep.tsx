"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { Minus, Plus, Volume2, Square } from "lucide-react";
import { VocabItem } from "@/lib/api";

interface ArticleStepProps {
  paragraphs: string[];
  vocabs: VocabItem[];
  articleFontSize: "sm" | "md" | "lg";
  setArticleFontSize: React.Dispatch<React.SetStateAction<"sm" | "md" | "lg">>;
  articleReadOnce: boolean;
  setArticleReadOnce: (value: boolean) => void;
  speakText: (text: string) => void;
  stopSpeaking: () => void;
  speaking: boolean;
}

interface HighlightedTextProps {
  text: string;
  vocabs: VocabItem[];
  speakText: (text: string) => void;
  speaking: boolean;
  highlightedSentence?: string | null;
  className?: string;
}

function splitIntoSentences(text: string): string[] {
  const sentenceEndings = /([.!?:]+[\s""\u201C\u201D\u201E\u201F]*)/g;
  const parts = text.split(sentenceEndings);
  const sentences: string[] = [];
  let current = "";
  
  for (let i = 0; i < parts.length; i++) {
    current += parts[i];
    if (i % 2 === 1 || i === parts.length - 1) {
      const trimmed = current.trim();
      if (trimmed.length > 0) {
        sentences.push(trimmed);
      }
      current = "";
    }
  }
  
  return sentences;
}

function HighlightedText({ text, vocabs, speakText, speaking, highlightedSentence, className = "" }: HighlightedTextProps) {
  const [activeVocab, setActiveVocab] = useState<VocabItem | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [speakingTerm, setSpeakingTerm] = useState<string | null>(null);

  const sentences = useMemo(() => splitIntoSentences(text), [text]);

  const renderSentenceWithVocab = (sentence: string, sentenceIndex: number) => {
    if (!vocabs.length) return <span key={sentenceIndex}>{sentence} </span>;

    const escapedTerms = vocabs.map(v => v.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const pattern = new RegExp(`(${escapedTerms.join('|')})`, 'gi');
    const parts = sentence.split(pattern);

    return (
      <span 
        key={sentenceIndex}
        className={`transition-all duration-300 ${
          highlightedSentence === sentence 
            ? "bg-primary/20 rounded px-1 -mx-1" 
            : ""
        }`}
      >
        {parts.map((part, partIndex) => {
          const lowerPart = part.toLowerCase();
          const matchedVocab = vocabs.find(v => v.term.toLowerCase() === lowerPart);

          if (matchedVocab) {
            return (
              <span key={partIndex} className="relative inline">
                <button
                  type="button"
                  onClick={(e) => handleVocabClick(matchedVocab, e)}
                  className="relative inline text-foreground underline decoration-primary/40 decoration-2 underline-offset-2 hover:decoration-primary hover:text-primary transition-colors cursor-pointer"
                >
                  {part}
                </button>
                {activeVocab?.term === matchedVocab.term && (
                  <>
                    <div 
                      className="fixed inset-0 z-40"
                      onClick={() => setActiveVocab(null)}
                    />
                    <div 
                      className="fixed z-50 w-72 bg-white rounded-xl shadow-xl border-2 border-primary/20 p-4 animate-in fade-in slide-in-from-top-2 duration-200"
                      style={{ 
                        left: `${Math.min(Math.max(tooltipPosition.x - 144, 16), window.innerWidth - 304)}px`,
                        top: `${tooltipPosition.y}px`
                      }}
                    >
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-l-2 border-t-2 border-primary/20 rotate-45" />
                      <div className="relative">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="font-[family-name:var(--font-fraunces)] text-base font-bold text-foreground">
                            {matchedVocab.term}
                          </p>
                          <button
                            type="button"
                            onClick={(e) => handleSpeakVocab(matchedVocab.term, e)}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shrink-0 ${
                              speakingTerm === matchedVocab.term
                                ? "bg-primary text-white animate-pulse"
                                : "bg-primary/10 text-primary hover:bg-primary hover:text-white"
                            }`}
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="font-[family-name:var(--font-dm-sans)] text-sm text-gray-700 mb-2">
                          {matchedVocab.meaning}
                        </p>
                        {matchedVocab.example && (
                          <div className="bg-cream/50 rounded-lg px-3 py-2 border border-cream-dark/30">
                            <p className="font-[family-name:var(--font-dm-sans)] text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">
                              Example
                            </p>
                            <p className="font-[family-name:var(--font-dm-sans)] text-xs text-gray-700 italic">
                              &ldquo;{matchedVocab.example}&rdquo;
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </span>
            );
          }
          return <span key={partIndex}>{part}</span>;
        })}{" "}
      </span>
    );
  };

  const handleVocabClick = (vocab: VocabItem, event: React.MouseEvent) => {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    setTooltipPosition({ 
      x: rect.left + rect.width / 2, 
      y: rect.bottom + 8 
    });
    setActiveVocab(activeVocab?.term === vocab.term ? null : vocab);
  };

  const handleSpeakVocab = (term: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSpeakingTerm(term);
    speakText(term);
    setTimeout(() => setSpeakingTerm(null), 2000);
  };

  return (
    <span className={className}>
      {sentences.map((sentence, idx) => renderSentenceWithVocab(sentence, idx))}
    </span>
  );
}

export function ArticleStep({
  paragraphs,
  vocabs,
  articleFontSize,
  setArticleFontSize,
  articleReadOnce,
  setArticleReadOnce,
  speakText,
  stopSpeaking,
  speaking,
}: ArticleStepProps) {
  const [speakingParagraph, setSpeakingParagraph] = useState<number | null>(null);
  const [currentSentence, setCurrentSentence] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sentenceQueueRef = useRef<string[]>([]);
  const isPlayingRef = useRef(false);

  const articleTextSizeClass =
    articleFontSize === "sm"
      ? "text-base leading-relaxed"
      : articleFontSize === "md"
      ? "text-lg leading-relaxed"
      : "text-xl leading-loose";

  const playSentence = useCallback(async (sentence: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const audioUrl = `${apiUrl}/api/v1/agents/tts?text=${encodeURIComponent(sentence)}&lang=de`;
      
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onended = () => {
        audioRef.current = null;
        resolve();
      };
      
      audio.onerror = () => {
        audioRef.current = null;
        reject(new Error('Audio playback failed'));
      };
      
      audio.play().catch(reject);
    });
  }, []);

  const playParagraph = useCallback(async (text: string, paragraphIndex: number) => {
    const sentences = splitIntoSentences(text);
    sentenceQueueRef.current = sentences;
    isPlayingRef.current = true;
    setSpeakingParagraph(paragraphIndex);

    for (const sentence of sentences) {
      if (!isPlayingRef.current) break;
      
      setCurrentSentence(sentence);
      try {
        await playSentence(sentence);
      } catch {
        break;
      }
    }

    isPlayingRef.current = false;
    setSpeakingParagraph(null);
    setCurrentSentence(null);
    sentenceQueueRef.current = [];
  }, [playSentence]);

  const handleSpeak = (text: string, index: number) => {
    if (speakingParagraph === index && isPlayingRef.current) {
      handleStop();
      return;
    }
    
    handleStop();
    playParagraph(text, index);
  };

  const handleStop = useCallback(() => {
    isPlayingRef.current = false;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    stopSpeaking();
    setSpeakingParagraph(null);
    setCurrentSentence(null);
    sentenceQueueRef.current = [];
  }, [stopSpeaking]);

  useEffect(() => {
    return () => {
      isPlayingRef.current = false;
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const isCurrentlyPlaying = speakingParagraph !== null;

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-3xl space-y-4">
        <div>
          <p className="font-[family-name:var(--font-dm-sans)] text-[11px] text-gray-500 mb-1">
            Step 2 · Read the story
          </p>
          <p className="font-[family-name:var(--font-dm-sans)] text-xs text-gray-600">
            Read the German text once or twice without translating every word. Focus on the main idea and how
            your vocab shows up in context. <span className="text-primary font-medium">Tap highlighted words</span> to see their meanings.
          </p>
        </div>

        <div className="flex items-center justify-between text-[11px] font-[family-name:var(--font-dm-sans)] text-gray-600">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="underline decoration-primary/40 decoration-2 underline-offset-2 text-[10px]">word</span>
              <span className="text-[10px] text-gray-500">= tap for meaning</span>
            </div>
            {isCurrentlyPlaying && (
              <button
                type="button"
                onClick={handleStop}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
              >
                <Square className="w-3 h-3 fill-current" />
                <span className="text-[10px] font-medium">Stop reading</span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span>Reading comfort</span>
            <div className="inline-flex items-center gap-1 rounded-full border border-cream-dark/80 bg-cream/60 px-2 py-0.5">
              <button
                type="button"
                className="p-1 rounded-full hover:bg-cream-dark/60 transition-colors"
                onClick={() =>
                  setArticleFontSize((prev) => (prev === "sm" ? "sm" : prev === "md" ? "sm" : "md"))
                }
              >
                <Minus className="w-3 h-3" />
              </button>
              <span
                className={`px-1 font-[family-name:var(--font-dm-sans)] ${
                  articleFontSize === "sm"
                    ? "text-xs"
                    : articleFontSize === "md"
                    ? "text-sm"
                    : "text-base"
                }`}
              >
                A
              </span>
              <button
                type="button"
                className="p-1 rounded-full hover:bg-cream-dark/60 transition-colors"
                onClick={() =>
                  setArticleFontSize((prev) => (prev === "lg" ? "lg" : prev === "md" ? "lg" : "md"))
                }
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border-2 border-cream-dark px-8 py-6 space-y-6">
          {paragraphs.map((p, idx) => {
            const isCurrentSpeaking = speakingParagraph === idx;
            
            return (
              <div key={idx} className="group">
                <div className="flex items-start gap-3">
                  <div
                    className={`flex-1 font-[family-name:var(--font-dm-sans)] ${articleTextSizeClass} text-foreground rounded-lg px-4 py-3 transition-all duration-300 tracking-wide ${
                      isCurrentSpeaking 
                        ? "bg-cream/50 ring-2 ring-primary/10" 
                        : "hover:bg-cream-dark/10"
                    }`}
                    style={{ wordSpacing: '0.1em' }}
                  >
                    <HighlightedText 
                      text={p} 
                      vocabs={vocabs} 
                      speakText={speakText}
                      speaking={speaking}
                      highlightedSentence={isCurrentSpeaking ? currentSentence : null}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSpeak(p, idx)}
                    className={`mt-1 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isCurrentSpeaking
                        ? "bg-primary text-white shadow-lg scale-110"
                        : "border border-cream-dark/80 bg-cream/70 text-foreground hover:bg-primary hover:text-white hover:border-primary"
                    }`}
                  >
                    {isCurrentSpeaking ? (
                      <Square className="w-4 h-4 fill-current" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between mt-2">
          <label className="flex items-center gap-2 text-xs font-[family-name:var(--font-dm-sans)] text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-cream-dark text-primary focus:ring-primary/20"
              checked={articleReadOnce}
              onChange={(e) => setArticleReadOnce(e.target.checked)}
            />
            <span>I&apos;ve read the story once.</span>
          </label>
          <span className="font-[family-name:var(--font-dm-sans)] text-[11px] text-gray-500">
            You&apos;ll see detailed feedback after the questions.
          </span>
        </div>
      </div>
    </div>
  );
}
