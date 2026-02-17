"use client";

import { useEffect, useRef, useState } from "react";
import { TeacherMessage } from "@/types/teacher";
import { Send, GraduationCap, Sparkles, Lightbulb, BookOpen, MessageCircle } from "lucide-react";

interface TeacherChatProps {
  messages: TeacherMessage[];
  onSend: (message: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

const quickQuestions = [
  { icon: BookOpen, text: "Explain grammar", question: "Can you explain the difference between 'der', 'die', and 'das'?" },
  { icon: Lightbulb, text: "Vocabulary help", question: "What are some common German phrases I should know?" },
  { icon: MessageCircle, text: "Usage examples", question: "Can you give me examples of how to use 'wenn' clauses in German?" },
];

function formatMessageText(text: string, isAI: boolean): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let currentIndex = 0;
  
  const patterns = [
    { regex: /\*\*(.*?)\*\*/g, type: 'bold' },
    { regex: /\*(.*?)\*/g, type: 'italic' },
    { regex: /^-\s+(.+)$/gm, type: 'bullet' },
  ];
  
  const lines = text.split('\n');
  
  return (
    <div className="space-y-2">
      {lines.map((line, lineIdx) => {
        if (line.trim() === '') {
          return <br key={lineIdx} />;
        }
        
        const isBullet = line.match(/^-\s+(.+)$/);
        if (isBullet) {
          return (
            <div key={lineIdx} className="flex items-start gap-2 ml-2">
              <span className={`text-primary mt-1.5 ${isAI ? "" : "text-white"}`}>•</span>
              <span className="flex-1">{formatInlineText(isBullet[1], isAI)}</span>
            </div>
          );
        }
        
        return (
          <div key={lineIdx} className="leading-relaxed">
            {formatInlineText(line, isAI)}
          </div>
        );
      })}
    </div>
  );
}

function formatInlineText(text: string, isAI: boolean): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;
  
  const boldRegex = /\*\*(.*?)\*\*/g;
  const italicRegex = /(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g;
  
  const matches: Array<{ start: number; end: number; type: 'bold' | 'italic'; content: string }> = [];
  
  let match;
  while ((match = boldRegex.exec(text)) !== null) {
    matches.push({
      start: match.index,
      end: match.index + match[0].length,
      type: 'bold',
      content: match[1],
    });
  }
  
  while ((match = italicRegex.exec(text)) !== null) {
    const start = match.index;
    const end = start + match[0].length;
    if (!matches.some(m => (start >= m.start && start < m.end) || (end > m.start && end <= m.end))) {
      matches.push({
        start,
        end,
        type: 'italic',
        content: match[1],
      });
    }
  }
  
  matches.sort((a, b) => a.start - b.start);
  
  let currentIndex = 0;
  
  matches.forEach((match) => {
    if (match.start > currentIndex) {
      parts.push(
        <span key={key++}>{text.substring(currentIndex, match.start)}</span>
      );
    }
    
    const className = isAI 
      ? match.type === 'bold' 
        ? "font-bold text-foreground" 
        : "italic text-primary font-medium"
      : match.type === 'bold'
        ? "font-bold text-white"
        : "italic text-white/90";
    
    parts.push(
      <span key={key++} className={className}>
        {match.content}
      </span>
    );
    
    currentIndex = match.end;
  });
  
  if (currentIndex < text.length) {
    parts.push(<span key={key++}>{text.substring(currentIndex)}</span>);
  }
  
  return parts.length > 0 ? <>{parts}</> : text;
}

function TeacherMessageBubble({ message }: { message: TeacherMessage }) {
  const isAI = message.role === "assistant";
  const timeString = new Date(message.timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <div className={`flex items-start gap-3 mb-6 ${isAI ? "" : "justify-end"} animate-fade-in-up`}>
      {isAI && (
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
          <GraduationCap className="w-4 h-4 text-primary" />
        </div>
      )}
      <div className={`flex-1 ${isAI ? "" : "flex justify-end"}`}>
        <div
          className={`rounded-2xl px-5 py-4 inline-block max-w-[85%] shadow-sm ${
            isAI
              ? "bg-white rounded-tl-sm text-foreground"
              : "bg-primary rounded-tr-sm text-white shadow-md"
          }`}
        >
          <div className={`font-[family-name:var(--font-dm-sans)] text-sm ${
            isAI ? "text-foreground" : "text-white"
          }`}>
            {formatMessageText(message.content, isAI)}
          </div>
          <div className="flex items-center gap-2 mt-3">
            <span
              className={`font-[family-name:var(--font-dm-sans)] text-[10px] ${
                isAI ? "text-gray-500" : "text-white/70"
              }`}
            >
              {timeString}
            </span>
          </div>
        </div>
      </div>
      {!isAI && (
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1">
          <MessageCircle className="w-4 h-4 text-primary" />
        </div>
      )}
    </div>
  );
}

export function TeacherChat({ messages, onSend, isLoading = false, disabled = false }: TeacherChatProps) {
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = () => {
    if (inputText.trim() && !disabled && !isLoading) {
      onSend(inputText.trim());
      setInputText("");
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickQuestion = (question: string) => {
    if (!disabled && !isLoading) {
      onSend(question);
    }
  };

  return (
    <div className="flex flex-col h-full bg-cream">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 && (
            <div className="text-center py-12 px-4 animate-fade-in-up">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-[family-name:var(--font-fraunces)] text-xl font-bold text-foreground mb-2">
                Welcome to German Teacher!
              </h3>
              <p className="font-[family-name:var(--font-dm-sans)] text-sm text-gray-600 mb-8 max-w-md mx-auto">
                I'm your German teacher! Ask me anything about grammar, vocabulary, pronunciation, or get explanations and examples. I'll help you understand and learn.
              </p>
              
              <div className="space-y-3 max-w-lg mx-auto">
                <p className="font-[family-name:var(--font-dm-sans)] text-xs text-gray-500 uppercase tracking-wide mb-2">
                  Try asking:
                </p>
                {quickQuestions.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleQuickQuestion(item.question)}
                      disabled={disabled || isLoading}
                      className="w-full text-left bg-white rounded-xl p-4 border-2 border-cream-dark hover:border-primary/30 hover:shadow-md transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-[family-name:var(--font-dm-sans)] text-xs font-medium text-gray-500 mb-1">
                            {item.text}
                          </p>
                          <p className="font-[family-name:var(--font-dm-sans)] text-sm text-foreground">
                            {item.question}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          
          {messages.length > 0 && (
            <div className="space-y-2">
              {messages.map((message) => (
                <TeacherMessageBubble key={message.id} message={message} />
              ))}
            </div>
          )}
          
          {isLoading && (
            <div className="flex items-start gap-3 mb-6 animate-fade-in-up">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                <GraduationCap className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <div className="bg-white rounded-2xl rounded-tl-sm px-5 py-4 inline-block max-w-[85%] border border-cream-dark/50 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="font-[family-name:var(--font-dm-sans)] text-xs text-gray-500">Teacher is thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <div className="border-t border-cream-dark bg-white p-4 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={disabled || isLoading}
                placeholder={disabled ? "Chat disabled" : isLoading ? "Teacher is responding..." : "Ask your teacher a question..."}
                className={`w-full px-4 py-3 pr-12 rounded-xl border-2 font-[family-name:var(--font-dm-sans)] text-sm transition-all ${
                  disabled || isLoading
                    ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-white border-cream-dark text-foreground placeholder:text-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm"
                }`}
              />
              {inputText.trim() && !disabled && !isLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Sparkles className="w-4 h-4 text-primary/50" />
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleSend}
              disabled={disabled || !inputText.trim() || isLoading}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shrink-0 ${
                disabled || !inputText.trim() || isLoading
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-primary hover:bg-primary-dark text-white shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
              }`}
              title="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          {messages.length === 0 && (
            <p className="text-center mt-3">
              <span className="font-[family-name:var(--font-dm-sans)] text-[10px] text-gray-400">
                Tip: Click on the suggestions above or type your own question
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
