"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ChevronLeft, ChevronRight, BookOpen, Languages, MessageCircleQuestion, Loader2, Lock, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { apiClient, API_ENDPOINTS } from "@/lib/api";
import { getApiBaseUrl } from "@/lib/config/env";
import { AgentOutput, EvaluateLessonOutput, LessonProgress, LessonHistoryItem } from "@/types/lesson";
import { LessonStreamEvent } from "@/types/api";
import { formatDate } from "@/lib/utils/format";
import { VocabStep, ArticleStep, GrammarStep, QuestionsStep, EvaluationStep } from "./components";
import { PremiumGuard } from "@/components/common/PremiumGuard";

type ReadStep = "vocab" | "article" | "grammar" | "questions" | "evaluation";

export default function ReadLessonPage() {
  const { loading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [step, setStep] = useState<ReadStep>("vocab");
  const [lesson, setLesson] = useState<AgentOutput | null>(null);
  const [lessonLoading, setLessonLoading] = useState(true);
  const [lessonError, setLessonError] = useState<string | null>(null);
  const [isNewLesson, setIsNewLesson] = useState<boolean | null>(null);
  const [progressStep, setProgressStep] = useState<string>("lesson");
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [evaluation, setEvaluation] = useState<EvaluateLessonOutput | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [activeVocabIndex, setActiveVocabIndex] = useState(0);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [readVocab, setReadVocab] = useState<boolean[]>([]);
  const [readGrammar, setReadGrammar] = useState<boolean[]>([]);
  const [articleFontSize, setArticleFontSize] = useState<"sm" | "md" | "lg">("lg");
  const [articleReadOnce, setArticleReadOnce] = useState(false);
  const [sidebarHidden, setSidebarHidden] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [audioRef] = useState<{ current: HTMLAudioElement | null }>({ current: null });
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initialLoadRef = useRef(true);
  const creatingLessonRef = useRef(false);
  const progressDataRef = useRef({
    step: "vocab" as ReadStep,
    readVocab: [] as boolean[],
    articleReadOnce: false,
    answers: {} as Record<number, string>,
    activeVocabIndex: 0,
    activeQuestionIndex: 0,
  });

  const [lessonsHistory, setLessonsHistory] = useState<LessonHistoryItem[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);

  const isReadOnly = lesson?.completed || (lesson?.is_today === false);

  const speakText = useCallback(async (text: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    setSpeaking(true);
    
    try {
      const apiUrl = getApiBaseUrl();
      const audioUrl = `${apiUrl}${API_ENDPOINTS.AGENTS.TTS}?text=${encodeURIComponent(text)}&lang=de`;
      
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onended = () => {
        setSpeaking(false);
        audioRef.current = null;
      };
      
      audio.onerror = () => {
        setSpeaking(false);
        audioRef.current = null;
      };
      
      await audio.play();
    } catch {
      setSpeaking(false);
    }
  }, [audioRef]);

  const stopSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setSpeaking(false);
  }, [audioRef]);

  const loadLessonData = useCallback((data: AgentOutput) => {
    setLesson(data);
    
    const grammarItems = data.grammar || [];
    
    if (data.progress && Object.keys(data.progress).length > 0) {
      const p = data.progress;
      setStep(p.current_step as ReadStep || "vocab");
      setReadVocab(p.vocab_read?.length ? p.vocab_read : data.vocabs.map((_, i) => i === 0));
      setReadGrammar(grammarItems.map((_, i) => i === 0));
      setArticleReadOnce(p.article_read_once || false);
      setAnswers(p.answers || {});
      setActiveVocabIndex(p.active_vocab_index || 0);
      setActiveQuestionIndex(p.active_question_index || 0);
    } else {
      setStep("vocab");
      setReadVocab(data.vocabs.map((_, i) => i === 0));
      setReadGrammar(grammarItems.map((_, i) => i === 0));
      setArticleReadOnce(false);
      setAnswers({});
      setActiveVocabIndex(0);
      setActiveQuestionIndex(0);
    }
    
    if (data.evaluation) {
      setEvaluation(data.evaluation);
      if (data.evaluation.score !== undefined) {
        setStep("evaluation");
      }
    } else {
      setEvaluation(null);
    }
  }, []);

  const fetchLessonById = useCallback(async (lessonId: number) => {
    try {
      setLessonLoading(true);
      setLessonError(null);
      setIsNewLesson(false);
      initialLoadRef.current = true;
      
      const data = await apiClient.getLessonById(lessonId);
      loadLessonData(data);
      setSelectedLessonId(lessonId);
      
      initialLoadRef.current = false;
    } catch (err) {
      setLessonError(err instanceof Error ? err.message : "Failed to load lesson");
    } finally {
      setLessonLoading(false);
    }
  }, [loadLessonData]);

  const fetchTodayLesson = useCallback(async () => {
    if (creatingLessonRef.current) {
      return;
    }
    creatingLessonRef.current = true;
    try {
      setLessonLoading(true);
      setLessonError(null);
      setIsNewLesson(null);
      setProgressStep("lesson");
      initialLoadRef.current = true;
      
      let receivedProgress = false;
      const data = await apiClient.createLesson((event: LessonStreamEvent) => {
        if (event.type === 'progress' && event.step && event.message) {
          receivedProgress = true;
          setIsNewLesson(true);
          setProgressStep(event.step);
        }
        if (event.type === 'complete' && !receivedProgress) {
          setIsNewLesson(false);
        }
      });
      
      loadLessonData(data);
      setSelectedLessonId(data.lesson.id || null);
      
      if (receivedProgress) {
        const history = await apiClient.getLessonsHistory();
        setLessonsHistory(history);
      }
      
      initialLoadRef.current = false;
    } catch (err) {
      setLessonError(err instanceof Error ? err.message : "Failed to load lesson");
    } finally {
      setLessonLoading(false);
      creatingLessonRef.current = false;
    }
  }, [loadLessonData]);

  const fetchHistory = useCallback(async () => {
    try {
      const history = await apiClient.getLessonsHistory();
      setLessonsHistory(history);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
  }, []);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      setChecking(false);
      fetchTodayLesson();
      fetchHistory();
    }
  }, [loading, isAuthenticated, fetchTodayLesson, fetchHistory]);

  useEffect(() => {
    progressDataRef.current = {
      step,
      readVocab,
      articleReadOnce,
      answers,
      activeVocabIndex,
      activeQuestionIndex,
    };
  }, [step, readVocab, articleReadOnce, answers, activeVocabIndex, activeQuestionIndex]);

  const saveProgress = useCallback(async () => {
    if (!lesson || initialLoadRef.current || isReadOnly) return;
    
    const data = progressDataRef.current;
    const progress: LessonProgress = {
      current_step: data.step,
      vocab_read: data.readVocab,
      article_read_once: data.articleReadOnce,
      answers: data.answers,
      active_vocab_index: data.activeVocabIndex,
      active_question_index: data.activeQuestionIndex,
    };
    
    try {
      await apiClient.updateProgress(progress);
    } catch (err) {
      console.error("Failed to save progress:", err);
    }
  }, [lesson, isReadOnly]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!initialLoadRef.current && lesson && !isReadOnly) {
        const token = localStorage.getItem("auth_token");
        if (!token) return;
        
        const data = progressDataRef.current;
        const progress: LessonProgress = {
          current_step: data.step,
          vocab_read: data.readVocab,
          article_read_once: data.articleReadOnce,
          answers: data.answers,
          active_vocab_index: data.activeVocabIndex,
          active_question_index: data.activeQuestionIndex,
        };
        apiClient.updateProgress(progress).catch(console.error);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [lesson, isReadOnly]);

  useEffect(() => {
    if (initialLoadRef.current || !lesson || isReadOnly) return;
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      saveProgress();
    }, 2000);
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [readVocab, articleReadOnce, activeVocabIndex, saveProgress, lesson, isReadOnly]);

  useEffect(() => {
    if (initialLoadRef.current || !lesson || isReadOnly) return;
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveProgress();
  }, [step, saveProgress, lesson, isReadOnly]);

  const handleAnswerChange = (questionId: number, value: string) => {
    if (isReadOnly) return;
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleAddVocab = useCallback((vocab: { term: string; meaning: string; example: string }) => {
    if (!lesson || isReadOnly) return;
    
    const exists = lesson.vocabs.some(v => v.term.toLowerCase() === vocab.term.toLowerCase());
    if (exists) return;
    
    setLesson(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        vocabs: [...prev.vocabs, vocab]
      };
    });
    
    setReadVocab(prev => [...prev, true]);
  }, [lesson, isReadOnly]);

  const handleSubmitAnswers = async () => {
    if (!lesson || isReadOnly) return;
    setEvaluating(true);
    try {
      const answersArray = lesson.questions.map((q) => ({
        question_id: q.id,
        answer: answers[q.id] ?? "",
      }));
      const result = await apiClient.evaluateLesson({ answers: answersArray });
      setEvaluation(result);
      setStep("evaluation");
      setLesson(prev => prev ? { ...prev, completed: true } : null);
      fetchHistory();
    } catch (err) {
      console.error("Failed to evaluate:", err);
    } finally {
      setEvaluating(false);
    }
  };


  if (loading || checking || lessonLoading) {
    const steps = [
      { key: "lesson", label: "Article", icon: BookOpen },
      { key: "vocab", label: "Vocabulary", icon: Languages },
      { key: "grammar", label: "Grammar", icon: BookOpen },
      { key: "questions", label: "Questions", icon: MessageCircleQuestion },
    ];
    const currentIndex = steps.findIndex(s => s.key === progressStep);
    
    if (isNewLesson === false) {
      return (
        <div className="h-screen bg-cream flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-14 h-14 rounded-full flex items-center justify-center bg-primary/5">
              <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <h2 className="font-[family-name:var(--font-fraunces)] text-xl font-bold text-foreground">
              Loading your lesson
            </h2>
          </div>
        </div>
      );
    }
    
    return (
      <div className="h-screen bg-cream flex items-center justify-center">
        <div className="flex flex-col items-center gap-8">
          <h2 className="font-[family-name:var(--font-fraunces)] text-xl font-bold text-foreground">
            Creating your lesson
          </h2>
          {lessonLoading ? (
            <div className="flex items-center gap-6">
              {steps.map((s, i) => {
                const isComplete = currentIndex > i;
                const isCurrent = currentIndex === i;
                const Icon = s.icon;
                
                return (
                  <div key={s.key} className="flex flex-col items-center gap-2">
                    <div
                      className={`relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isComplete
                          ? "bg-primary/10"
                          : isCurrent
                          ? "bg-primary/5"
                          : "bg-cream-dark/30"
                      }`}
                    >
                      {isCurrent && (
                        <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                      )}
                      {isComplete && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                          <CheckCircle2 className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <Icon
                        className={`w-6 h-6 transition-colors ${
                          isComplete
                            ? "text-primary"
                            : isCurrent
                            ? "text-primary animate-pulse"
                            : "text-gray-400"
                        }`}
                      />
                    </div>
                    <span
                      className={`font-[family-name:var(--font-dm-sans)] text-xs transition-colors ${
                        isComplete
                          ? "text-primary font-medium"
                          : isCurrent
                          ? "text-foreground font-medium"
                          : "text-gray-400"
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center gap-3 font-[family-name:var(--font-dm-sans)] text-gray-600">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              Loading...
            </div>
          )}
        </div>
      </div>
    );
  }

  if (lessonError || !lesson) {
    return (
      <div className="h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="font-[family-name:var(--font-dm-sans)] text-red-600 mb-4">
            {lessonError || "Failed to load lesson"}
          </div>
          <button
            type="button"
            className="font-[family-name:var(--font-dm-sans)] text-sm px-4 py-2 rounded-full border border-primary text-white bg-primary"
            onClick={fetchTodayLesson}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const stepOrder: ReadStep[] = ["vocab", "article", "grammar", "questions", "evaluation"];
  const currentStepIndex = stepOrder.indexOf(step);
  const allVocabRead = readVocab.every(Boolean);
  const allGrammarRead = readGrammar.every(Boolean);
  const allQuestionsAnswered = lesson.questions.every((q) => (answers[q.id] ?? "").trim().length > 0);

  return (
    <PremiumGuard>
      <div className="h-screen bg-cream flex flex-col overflow-hidden">
      <Navbar onLogout={logout} />

      <div className="flex-1 flex overflow-hidden">
        {!sidebarHidden && (
          <aside className="w-80 bg-white border-r border-cream-dark flex flex-col overflow-y-auto">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-[family-name:var(--font-fraunces)] text-lg font-bold text-foreground">
                  Lessons
                </h2>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-full border border-cream-dark/80 px-2 py-0.5 text-[11px] font-[family-name:var(--font-dm-sans)] text-gray-600 hover:bg-cream-dark/40 transition-colors"
                  onClick={() => setSidebarHidden(true)}
                >
                  <ChevronLeft className="w-3 h-3" />
                  Hide
                </button>
              </div>
              
              <div className="space-y-2">
                {lessonsHistory.map((item) => {
                  const isSelected = item.id === selectedLessonId;
                  const isToday = formatDate(item.created_at) === "Today";
                  
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        if (!isSelected) {
                          fetchLessonById(item.id);
                        }
                      }}
                      className={`w-full text-left rounded-2xl border px-3 py-2.5 text-xs font-[family-name:var(--font-dm-sans)] transition-colors ${
                        isSelected
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-cream-dark bg-white text-foreground hover:bg-cream-dark/20"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className="font-medium line-clamp-2">{item.title}</span>
                        <span className="text-[10px] text-gray-500 whitespace-nowrap flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(item.created_at)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.completed ? (
                          <>
                            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              Completed
                            </span>
                            {item.score !== null && (
                              <span className="text-[10px] text-gray-500">
                                Score: {item.score}/100
                              </span>
                            )}
                          </>
                        ) : isToday ? (
                          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] bg-amber-50 text-amber-700 border border-amber-200">
                            In progress
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] bg-gray-100 text-gray-600">
                            <Lock className="w-3 h-3" />
                            Incomplete
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
                
                {lessonsHistory.length === 0 && (
                  <p className="text-xs text-gray-500 text-center py-4">
                    No lessons yet
                  </p>
                )}
              </div>
            </div>
          </aside>
        )}

        <main className="flex-1 flex flex-col overflow-hidden">
          {sidebarHidden && (
            <div className="bg-white border-b border-cream-dark px-3 py-2 flex items-center gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-full border border-cream-dark/80 px-2 py-0.5 text-[11px] font-[family-name:var(--font-dm-sans)] text-gray-600 hover:bg-cream-dark/40 transition-colors"
                onClick={() => setSidebarHidden(false)}
              >
                <ChevronRight className="w-3 h-3" />
                Show history
              </button>
            </div>
          )}
          <div className="bg-white border-b border-cream-dark px-8 py-4 shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-[family-name:var(--font-dm-sans)] text-xs uppercase tracking-wide text-gray-500">
                    {isReadOnly ? "Review lesson" : "Read lesson"}
                  </p>
                  {isReadOnly && (
                    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-[family-name:var(--font-dm-sans)] bg-gray-100 text-gray-600 border border-gray-200">
                      <Lock className="w-3 h-3" />
                      Read only
                    </span>
                  )}
                </div>
                <h1 className="font-[family-name:var(--font-fraunces)] text-lg font-bold text-foreground">
                  {lesson.lesson.title}
                </h1>
              </div>
              <div className="flex items-center gap-2">
                {stepOrder.map((s, index) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      if (isReadOnly || index <= currentStepIndex) {
                        setStep(s);
                      }
                    }}
                    className="flex items-center gap-1"
                  >
                    <div
                      className={`w-2.5 h-2.5 rounded-full transition-colors ${
                        index === currentStepIndex
                          ? "bg-primary"
                          : index < currentStepIndex
                          ? "bg-primary/40"
                          : "bg-cream-dark"
                      } ${(isReadOnly || index <= currentStepIndex) ? "cursor-pointer hover:scale-125" : ""}`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col">
            {step === "vocab" && (
              <VocabStep
                vocabs={lesson.vocabs}
                activeVocabIndex={activeVocabIndex}
                setActiveVocabIndex={isReadOnly ? () => {} : setActiveVocabIndex}
                readVocab={readVocab}
                setReadVocab={isReadOnly ? () => {} : setReadVocab}
                speaking={speaking}
                speakText={speakText}
              />
            )}

            {step === "article" && (
              <ArticleStep
                paragraphs={lesson.lesson.paragraphs}
                vocabs={lesson.vocabs}
                articleFontSize={articleFontSize}
                setArticleFontSize={setArticleFontSize}
                articleReadOnce={articleReadOnce}
                setArticleReadOnce={isReadOnly ? () => {} : setArticleReadOnce}
                speakText={speakText}
                stopSpeaking={stopSpeaking}
                speaking={speaking}
                onAddVocab={isReadOnly ? undefined : handleAddVocab}
              />
            )}

            {step === "grammar" && lesson.grammar && (
              <GrammarStep
                grammar={lesson.grammar}
                readGrammar={readGrammar}
                setReadGrammar={isReadOnly ? () => {} : setReadGrammar}
                isReadOnly={isReadOnly}
              />
            )}

            {step === "questions" && (
              <QuestionsStep
                paragraphs={lesson.lesson.paragraphs}
                questions={lesson.questions}
                activeQuestionIndex={activeQuestionIndex}
                setActiveQuestionIndex={setActiveQuestionIndex}
                answers={answers}
                onAnswerChange={handleAnswerChange}
                articleFontSize={articleFontSize}
                onSaveProgress={isReadOnly ? () => {} : saveProgress}
              />
            )}

            {step === "evaluation" && evaluation && (
              <EvaluationStep
                evaluation={evaluation}
                questions={lesson.questions}
                answers={answers}
              />
            )}

            <div className="border-t border-cream-dark bg-white px-8 py-3 flex items-center justify-between">
              {isReadOnly ? (
                <>
                  <button
                    type="button"
                    className="font-[family-name:var(--font-dm-sans)] text-xs px-3 py-1.5 rounded-full border border-cream-dark/80 text-gray-700 bg-cream/60"
                    onClick={() => router.push("/dashboard")}
                  >
                    Back to dashboard
                  </button>
                  <div className="flex items-center gap-3">
                    {stepOrder.map((s, index) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setStep(s)}
                        className={`font-[family-name:var(--font-dm-sans)] text-xs px-3 py-1.5 rounded-full border transition-colors ${
                          step === s
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-cream-dark/80 text-gray-600 hover:bg-cream-dark/20"
                        }`}
                      >
                        {s === "vocab" && "Vocabulary"}
                        {s === "article" && "Article"}
                        {s === "grammar" && "Grammar"}
                        {s === "questions" && "Questions"}
                        {s === "evaluation" && "Evaluation"}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="font-[family-name:var(--font-dm-sans)] text-xs px-3 py-1.5 rounded-full border border-cream-dark/80 text-gray-700 bg-cream/60 disabled:opacity-50"
                    disabled={step === "vocab"}
                    onClick={() => {
                      if (step === "article") setStep("vocab");
                      if (step === "grammar") setStep("article");
                      if (step === "questions") setStep("grammar");
                      if (step === "evaluation") setStep("questions");
                    }}
                  >
                    Back
                  </button>
                  {step !== "evaluation" && (
                    <button
                      type="button"
                      className="font-[family-name:var(--font-dm-sans)] text-xs px-4 py-1.5 rounded-full border border-primary text-white bg-primary disabled:opacity-50"
                      disabled={
                        (step === "vocab" && !allVocabRead) ||
                        (step === "article" && !articleReadOnce) ||
                        (step === "grammar" && !allGrammarRead) ||
                        (step === "questions" && (!allQuestionsAnswered || evaluating))
                      }
                      onClick={() => {
                        if (step === "vocab") setStep("article");
                        else if (step === "article") setStep("grammar");
                        else if (step === "grammar") setStep("questions");
                        else if (step === "questions") handleSubmitAnswers();
                      }}
                    >
                      {step === "vocab" && "Start reading"}
                      {step === "article" && "Next: Grammar"}
                      {step === "grammar" && "Next: Questions"}
                      {step === "questions" && (evaluating ? "Evaluating..." : "Submit answers")}
                    </button>
                  )}
                  {step === "evaluation" && (
                    <button
                      type="button"
                      className="font-[family-name:var(--font-dm-sans)] text-xs px-4 py-1.5 rounded-full border border-primary text-white bg-primary"
                      onClick={() => router.push("/dashboard")}
                    >
                      Back to dashboard
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
    </PremiumGuard>
  );
}
