import { RoleplaySession, RoleplayMessage, RoleplayEvaluation, RoleplayHistoryItem } from '@/types/roleplay';

export const roleplaySessionMock: RoleplaySession = {
  title: "Ordering at a Restaurant",
  userRole: "Customer",
  aiRole: "Waiter",
  learningGoal: "Practice ordering food and making special requests in German",
  suggestedVocab: [
    { term: "die Speisekarte", meaning: "the menu" },
    { term: "bestellen", meaning: "to order" },
    { term: "die Vorspeise", meaning: "the appetizer" },
    { term: "das Hauptgericht", meaning: "the main course" },
    { term: "allergisch", meaning: "allergic" },
  ],
};

export const messagesMock: RoleplayMessage[] = [
  {
    id: "1",
    speaker: "ai",
    text: "Guten Abend! Willkommen in unserem Restaurant. Haben Sie einen Tisch reserviert?",
    timestamp: new Date(Date.now() - 300000),
  },
  {
    id: "2",
    speaker: "user",
    text: "Guten Abend! Ja, ich habe eine Reservierung für zwei Personen.",
    timestamp: new Date(Date.now() - 240000),
  },
  {
    id: "3",
    speaker: "ai",
    text: "Sehr gut! Bitte folgen Sie mir. Hier ist Ihre Speisekarte. Möchten Sie etwas zu trinken bestellen?",
    timestamp: new Date(Date.now() - 180000),
  },
];

export const evaluationMock: RoleplayEvaluation = {
  grammarScore: 85,
  clarityScore: 90,
  naturalnessScore: 78,
  keyMistake: {
    original: "Ich möchte bestellen ein Wasser",
    corrected: "Ich möchte ein Wasser bestellen",
    explanation: "In German, the verb 'bestellen' should come after the object 'ein Wasser'.",
  },
  improvedSentence: {
    original: "Das ist gut",
    improved: "Das klingt gut",
    explanation: "Using 'klingt' (sounds) is more natural when agreeing with a suggestion.",
  },
  vocabularyUpgrade: {
    original: "Ich will das",
    upgraded: "Ich hätte gerne das",
    explanation: "'Ich hätte gerne' is more polite and appropriate for restaurant settings.",
  },
};

export const initialGoalReachedMock = false;
export const initialSessionEndedMock = false;

export const roleplayHistoryMock: RoleplayHistoryItem[] = [
  {
    id: 1,
    title: "Ordering at a Restaurant",
    completed: true,
    score: 85,
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    title: "Asking for Directions",
    completed: true,
    score: 78,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 3,
    title: "Shopping at a Market",
    completed: false,
    score: null,
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
];
