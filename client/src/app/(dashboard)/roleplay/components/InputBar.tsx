"use client";

import { useState, useEffect, useRef, KeyboardEvent } from "react";
import { Mic, Send, MicOff } from "lucide-react";

interface InputBarProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  onMicrophoneClick?: () => void;
}

export function InputBar({ onSend, disabled = false, onMicrophoneClick }: InputBarProps) {
  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'de-DE';
        
        recognition.onstart = () => {
          setIsListening(true);
        };
        
        recognition.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = event.results[0][0].transcript;
          setInputText(transcript);
          setIsListening(false);
        };
        
        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          
          if (event.error === 'no-speech') {
            setIsListening(false);
          } else if (event.error === 'not-allowed') {
            alert('Microphone access denied. Please allow microphone access in your browser settings.');
          }
        };
        
        recognition.onend = () => {
          setIsListening(false);
        };
        
        recognitionRef.current = recognition;
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleMicrophoneClick = () => {
    if (disabled) return;
    
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        if (onMicrophoneClick) {
          onMicrophoneClick();
        }
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        setIsListening(false);
      }
    }
  };

  const handleSend = () => {
    if (inputText.trim() && !disabled) {
      onSend(inputText.trim());
      setInputText("");
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-cream-dark bg-white p-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleMicrophoneClick}
          disabled={disabled}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shrink-0 ${
            disabled
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : isListening
              ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
              : "bg-cream-dark hover:bg-cream text-gray-700"
          }`}
          title={isListening ? "Stop recording" : "Voice input"}
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={disabled}
          placeholder={disabled ? "Session ended" : "Type your message..."}
          className={`flex-1 px-4 py-2.5 rounded-xl border-2 font-[family-name:var(--font-dm-sans)] text-sm transition-colors ${
            disabled
              ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-white border-cream-dark text-foreground placeholder:text-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          }`}
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={disabled || !inputText.trim()}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shrink-0 ${
            disabled || !inputText.trim()
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-primary hover:bg-primary-dark text-white"
          }`}
          title="Send message"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
