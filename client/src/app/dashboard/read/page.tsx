 "use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Volume2, CheckCircle2, Minus, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";
import {
  fetchMockReadLesson,
  fetchMockReadSessions,
  ReadLesson,
  ReadSessionSummary,
  ReadEvaluation,
} from "@/lib/readLessonMock";

type ReadStep = "vocab" | "article" | "questions" | "evaluation";

export default function ReadLessonPage() {
  const { loading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [step, setStep] = useState<ReadStep>("vocab");
  const [lesson] = useState<ReadLesson>(() => fetchMockReadLesson());
  const [sessions] = useState<ReadSessionSummary[]>(() => fetchMockReadSessions());
  const [activeSessionId] = useState(sessions[0]?.id ?? null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [evaluation, setEvaluation] = useState<ReadEvaluation | null>(null);
  const [activeVocabIndex, setActiveVocabIndex] = useState(0);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [readVocab, setReadVocab] = useState<boolean[]>(() => lesson.vocab.map(() => false));
  const [articleFontSize, setArticleFontSize] = useState<"sm" | "md" | "lg">("sm");
  const [articleReadOnce, setArticleReadOnce] = useState(false);
  const [paragraphHintsOpen, setParagraphHintsOpen] = useState<boolean[]>(() =>
    lesson.article.paragraphs.map(() => false)
  );
  const [sidebarHidden, setSidebarHidden] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push("/login");
      } else {
        setChecking(false);
      }
    }
  }, [loading, isAuthenticated, router]);

  if (loading || checking) {
    return (
      <div className="h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="font-[family-name:var(--font-dm-sans)] text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmitAnswers = () => {
    const result = lesson.evaluate(lesson.questions, answers);
    setEvaluation(result);
    setStep("evaluation");
  };

  const activeQuestion = lesson.questions[activeQuestionIndex];

  const stepOrder: ReadStep[] = ["vocab", "article", "questions", "evaluation"];
  const currentStepIndex = stepOrder.indexOf(step);
  const allVocabRead = readVocab.every(Boolean);
  const allQuestionsAnswered = lesson.questions.every((q) => (answers[q.id] ?? "").trim().length > 0);

  const articleTextSizeClass =
    articleFontSize === "sm"
      ? "text-sm"
      : articleFontSize === "md"
      ? "text-base"
      : "text-lg";

  return (
    <div className="h-screen bg-cream flex flex-col overflow-hidden">
      <DashboardNavbar onLogout={logout} />

      <div className="flex-1 flex overflow-hidden">
        {!sidebarHidden && (
          <aside className="w-80 bg-white border-r border-cream-dark flex flex-col overflow-y-auto">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-[family-name:var(--font-fraunces)] text-lg font-bold text-foreground">
                  Read history
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
                {sessions.map((session) => (
                  <button
                    key={session.id}
                    type="button"
                    className={`w-full text-left rounded-2xl border px-3 py-2 text-xs font-[family-name:var(--font-dm-sans)] ${
                      session.id === activeSessionId
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-cream-dark bg-white text-gray-600"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span>{session.title}</span>
                      <span className="text-[10px] text-gray-500">{session.date}</span>
                    </div>
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] bg-cream-dark/20 text-gray-700">
                      {session.status}
                    </span>
                  </button>
                ))}
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
          <div className="bg-white border-b border-cream-dark px-8 py-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-[family-name:var(--font-dm-sans)] text-xs uppercase tracking-wide text-gray-500">
                  Read lesson
                </p>
                <h1 className="font-[family-name:var(--font-fraunces)] text-lg font-bold text-foreground">
                  {lesson.article.title}
                </h1>
              </div>
              <div className="flex items-center gap-2">
                {stepOrder.map((s, index) => (
                  <div key={s} className="flex items-center gap-1">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${
                        index === currentStepIndex
                          ? "bg-primary"
                          : index < currentStepIndex
                          ? "bg-primary/40"
                          : "bg-cream-dark"
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col">
            {step === "vocab" && (
              <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-4xl space-y-4">
                  <div>
                    <p className="font-[family-name:var(--font-dm-sans)] text-[11px] text-gray-500 mb-1">
                      Step 1 · Vocab for today&apos;s situation
                    </p>
                    <p className="font-[family-name:var(--font-dm-sans)] text-xs text-gray-600">
                      Get familiar with a few key words before you read the story. Tap each word and listen to the
                      pronunciation.
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl border-2 border-cream-dark px-6 py-4 flex items-center justify-between">
                    <div>
                      <p className="font-[family-name:var(--font-fraunces)] text-base font-bold text-foreground">
                        {lesson.vocab[activeVocabIndex].term}
                      </p>
                      <p className="font-[family-name:var(--font-dm-sans)] text-xs text-gray-600">
                        {lesson.vocab[activeVocabIndex].meaning}
                      </p>
                      {lesson.vocab[activeVocabIndex].example && (
                        <p className="font-[family-name:var(--font-dm-sans)] text-[11px] text-gray-500 mt-1">
                          {lesson.vocab[activeVocabIndex].example}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-[family-name:var(--font-dm-sans)] text-[11px] text-gray-500">
                        Word {activeVocabIndex + 1} / {lesson.vocab.length}
                      </span>
                      <button
                        type="button"
                        className="w-9 h-9 rounded-full border border-cream-dark/80 bg-cream/70 flex items-center justify-center text-foreground hover:bg-cream-dark/60 transition-colors"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    {lesson.vocab.map((item, index) => {
                      const isActive = index === activeVocabIndex;
                      const isRead = readVocab[index];
                      return (
                        <button
                          key={item.term}
                          type="button"
                          onClick={() => {
                            setActiveVocabIndex(index);
                            setReadVocab((prev) => {
                              const next = [...prev];
                              next[index] = true;
                              return next;
                            });
                          }}
                          className={`text-left rounded-2xl px-4 py-3 flex items-center justify-between gap-2 border-2 transition-all ${
                            isActive
                              ? "bg-primary/5 border-primary shadow-sm"
                              : "bg-white border-cream-dark hover:border-primary/60"
                          }`}
                        >
                          <span className="font-[family-name:var(--font-fraunces)] text-sm text-foreground">
                            {item.term}
                          </span>
                          {isRead && (
                            <span className="flex items-center gap-1 text-[11px] font-[family-name:var(--font-dm-sans)] text-emerald-700">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Read
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {step === "article" && (
              <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-3xl space-y-4">
                  <div>
                    <p className="font-[family-name:var(--font-dm-sans)] text-[11px] text-gray-500 mb-1">
                      Step 2 · Read the story
                    </p>
                    <p className="font-[family-name:var(--font-dm-sans)] text-xs text-gray-600">
                      Read the German text once or twice without translating every word. Focus on the main idea and how
                      your vocab shows up in context. You&apos;ll answer questions and get feedback afterwards.
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-[family-name:var(--font-dm-sans)] text-gray-600">
                    <span>Reading comfort</span>
                    <div className="flex items-center gap-2">
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

                  <div className="bg-white rounded-2xl border-2 border-cream-dark px-6 py-5 leading-relaxed space-y-4">
                    {lesson.article.paragraphs.map((p, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-start gap-3">
                          <p
                            className={`flex-1 font-[family-name:var(--font-dm-sans)] ${articleTextSizeClass} text-foreground rounded-md px-2 py-1 hover:bg-cream-dark/20 transition-colors`}
                          >
                            {p}
                          </p>
                          <button
                            type="button"
                            className="mt-1 w-8 h-8 rounded-full border border-cream-dark/80 bg-cream/70 flex items-center justify-center text-foreground hover:bg-cream-dark/60 transition-colors"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between ml-2">
                          <button
                            type="button"
                            className="text-[11px] font-[family-name:var(--font-dm-sans)] text-primary"
                            onClick={() =>
                              setParagraphHintsOpen((prev) => {
                                const next = [...prev];
                                next[idx] = !next[idx];
                                return next;
                              })
                            }
                          >
                            {paragraphHintsOpen[idx] ? "Hide hint" : "Show hint"}
                          </button>
                        </div>
                        {paragraphHintsOpen[idx] && (
                          <p className="font-[family-name:var(--font-dm-sans)] text-[11px] text-gray-500 italic px-2">
                            Hint: {lesson.article.hints[idx]}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <label className="flex items-center gap-2 text-xs font-[family-name:var(--font-dm-sans)] text-gray-700">
                      <input
                        type="checkbox"
                        className="rounded border-cream-dark"
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
            )}

            {step === "questions" && (
              <div className="flex-1 overflow-y-auto p-8">
                <div className="flex flex-col lg:flex-row gap-6 max-w-5xl">
                  <div className="flex-1 space-y-4">
                    <div>
                      <p className="font-[family-name:var(--font-dm-sans)] text-[11px] text-gray-500 mb-1">
                        Step 3 · Questions about the story
                      </p>
                      <p className="font-[family-name:var(--font-dm-sans)] text-xs text-gray-600">
                        Use the text on the left as support. Answer each question as best you can — you&apos;ll get a
                        score and detailed feedback next.
                      </p>
                    </div>
                    <div className="bg-white rounded-2xl border-2 border-cream-dark px-6 py-5 leading-relaxed space-y-4">
                      {lesson.article.paragraphs.map((p, idx) => (
                        <p
                          key={idx}
                          className={`font-[family-name:var(--font-dm-sans)] ${articleTextSizeClass} text-foreground`}
                        >
                          {p}
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="mb-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-[family-name:var(--font-dm-sans)] text-[11px] text-gray-500">
                          Questions
                        </p>
                        <p className="font-[family-name:var(--font-dm-sans)] text-[11px] text-gray-500">
                          {activeQuestionIndex + 1} / {lesson.questions.length}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {lesson.questions.map((q, idx) => {
                          const answered = (answers[q.id] ?? "").trim().length > 0;
                          const isActive = idx === activeQuestionIndex;
                          let classes =
                            "w-7 h-7 rounded-full border text-[11px] font-[family-name:var(--font-dm-sans)] flex items-center justify-center cursor-pointer transition-colors";
                          if (isActive) {
                            classes += " border-primary bg-primary text-white";
                          } else if (answered) {
                            classes += " border-emerald-200 bg-emerald-50 text-emerald-700";
                          } else {
                            classes += " border-cream-dark bg-white text-gray-500";
                          }
                          return (
                            <button
                              key={q.id}
                              type="button"
                              className={classes}
                              onClick={() => setActiveQuestionIndex(idx)}
                            >
                              {idx + 1}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="bg-white rounded-2xl border-2 border-cream-dark px-6 py-5">
                      <p className="font-[family-name:var(--font-fraunces)] text-base font-bold text-foreground mb-3">
                        {activeQuestion.prompt}
                      </p>
                      {activeQuestion.type === "mcq" && activeQuestion.options && (
                        <div className="space-y-2">
                          {activeQuestion.options.map((option, idx) => {
                            const key = `${activeQuestion.id}-${idx}`;
                            const selected = answers[activeQuestion.id] === String(idx);
                            return (
                              <button
                                key={key}
                                type="button"
                                className={`w-full text-left rounded-xl border px-3 py-2 text-sm font-[family-name:var(--font-dm-sans)] ${
                                  selected
                                    ? "border-primary bg-primary/10 text-foreground"
                                    : "border-cream-dark bg-white text-gray-700"
                                }`}
                                onClick={() => handleAnswerChange(activeQuestion.id, String(idx))}
                              >
                                {option}
                              </button>
                            );
                          })}
                        </div>
                      )}
                      {activeQuestion.type === "short" && (
                        <textarea
                          className="mt-2 w-full rounded-xl border border-cream-dark px-3 py-2 text-sm font-[family-name:var(--font-dm-sans)] text-foreground bg-white"
                          rows={4}
                          value={answers[activeQuestion.id] ?? ""}
                          onChange={(e) => handleAnswerChange(activeQuestion.id, e.target.value)}
                        />
                      )}
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <button
                        type="button"
                        className="font-[family-name:var(--font-dm-sans)] text-[11px] px-3 py-1.5 rounded-full border border-cream-dark/80 text-gray-700 bg-cream/60 disabled:opacity-50"
                        disabled={activeQuestionIndex === 0}
                        onClick={() =>
                          setActiveQuestionIndex((prev) => (prev === 0 ? 0 : prev - 1))
                        }
                      >
                        Previous question
                      </button>
                      <button
                        type="button"
                        className="font-[family-name:var(--font-dm-sans)] text-[11px] px-3 py-1.5 rounded-full border border-cream-dark/80 text-gray-700 bg-cream/60 disabled:opacity-50"
                        disabled={activeQuestionIndex === lesson.questions.length - 1}
                        onClick={() =>
                          setActiveQuestionIndex((prev) =>
                            prev === lesson.questions.length - 1 ? prev : prev + 1
                          )
                        }
                      >
                        Next question
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === "evaluation" && evaluation && (
              <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-3xl space-y-4">
                  <div className="bg-white rounded-2xl border-2 border-cream-dark px-6 py-5 flex items-center justify-between">
                    <div>
                      <p className="font-[family-name:var(--font-dm-sans)] text-xs text-gray-500">Your score</p>
                      <p className="font-[family-name:var(--font-fraunces)] text-2xl font-bold text-foreground">
                        {evaluation.score} / 100
                      </p>
                    </div>
                    <p className="font-[family-name:var(--font-dm-sans)] text-sm text-gray-600 max-w-xs">
                      {evaluation.summary}
                    </p>
                  </div>
                  <div className="bg-white rounded-2xl border-2 border-cream-dark px-6 py-5">
                    <p className="font-[family-name:var(--font-fraunces)] text-sm font-bold text-foreground mb-3">
                      Focus areas
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {evaluation.focusAreas.map((area) => (
                        <span
                          key={area}
                          className="inline-flex items-center rounded-full px-3 py-1 text-xs font-[family-name:var(--font-dm-sans)] bg-secondary/30 text-foreground"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl border-2 border-cream-dark px-6 py-5 space-y-3">
                    {lesson.questions.map((q) => {
                      const userAnswer = answers[q.id];
                      const detail = evaluation.details[q.id];
                      return (
                        <div key={q.id} className="border-b border-cream-dark/60 pb-3 last:border-b-0 last:pb-0">
                          <p className="font-[family-name:var(--font-fraunces)] text-sm font-bold text-foreground mb-1">
                            {q.prompt}
                          </p>
                          <p className="font-[family-name:var(--font-dm-sans)] text-xs text-gray-500 mb-1">
                            {detail.correct ? "Correct" : "Needs improvement"}
                          </p>
                          {q.type === "mcq" && q.options && (
                            <p className="font-[family-name:var(--font-dm-sans)] text-xs text-gray-600">
                              Correct answer: {q.options[detail.correctIndex ?? 0]}
                            </p>
                          )}
                          {q.type === "short" && (
                            <>
                              <p className="font-[family-name:var(--font-dm-sans)] text-xs text-gray-600">
                                Your answer: {userAnswer || "No answer"}
                              </p>
                              <p className="font-[family-name:var(--font-dm-sans)] text-xs text-gray-600">
                                Suggested answer: {detail.idealAnswer}
                              </p>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            <div className="border-t border-cream-dark bg-white px-8 py-3 flex items-center justify-between">
              <button
                type="button"
                className="font-[family-name:var(--font-dm-sans)] text-xs px-3 py-1.5 rounded-full border border-cream-dark/80 text-gray-700 bg-cream/60 disabled:opacity-50"
                disabled={step === "vocab"}
                onClick={() => {
                  if (step === "article") setStep("vocab");
                  if (step === "questions") setStep("article");
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
                    (step === "questions" && !allQuestionsAnswered)
                  }
                  onClick={() => {
                    if (step === "vocab") setStep("article");
                    else if (step === "article") setStep("questions");
                    else if (step === "questions") handleSubmitAnswers();
                  }}
                >
                  {step === "vocab" && "Start reading"}
                  {step === "article" && "Next: Questions"}
                  {step === "questions" && "Submit answers"}
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
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

