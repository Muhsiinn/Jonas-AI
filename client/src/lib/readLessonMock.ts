export type ReadVocab = {
  term: string;
  meaning: string;
  example?: string;
};

export type ReadArticle = {
  title: string;
  paragraphs: string[];
  hints: string[];
};

export type ReadQuestion =
  | {
      id: string;
      prompt: string;
      type: "mcq";
      options: string[];
      correctIndex: number;
    }
  | {
      id: string;
      prompt: string;
      type: "short";
      idealAnswer: string;
    };

export type ReadEvaluationDetail = {
  correct: boolean;
  correctIndex?: number;
  idealAnswer?: string;
};

export type ReadEvaluation = {
  score: number;
  summary: string;
  focusAreas: string[];
  details: Record<string, ReadEvaluationDetail>;
};

export type ReadLesson = {
  vocab: ReadVocab[];
  article: ReadArticle;
  questions: ReadQuestion[];
  evaluate: (questions: ReadQuestion[], answers: Record<string, string>) => ReadEvaluation;
};

export type ReadSessionSummary = {
  id: string;
  title: string;
  date: string;
  status: "Completed" | "In progress";
};

const mockLesson: ReadLesson = {
  vocab: [
    {
      term: "die U-Bahn",
      meaning: "subway, underground train",
      example: "Ich fahre jeden Morgen mit der U-Bahn zur Arbeit.",
    },
    {
      term: "das Gleis",
      meaning: "train platform, track",
      example: "Der Zug nach Berlin fährt von Gleis drei ab.",
    },
    {
      term: "verspäten",
      meaning: "to be delayed",
      example: "Der Zug ist wegen Bauarbeiten zehn Minuten verspätet.",
    },
    {
      term: "umsteigen",
      meaning: "to change trains",
      example: "In München musst du in die S-Bahn umsteigen.",
    },
    {
      term: "die Auskunft",
      meaning: "information desk",
      example: "Frag doch an der Auskunft nach dem richtigen Gleis.",
    },
  ],
  article: {
    title: "Morgens in der U-Bahn",
    paragraphs: [
      "Es ist halb acht am Morgen, und Jonas steht am Bahngleis. Die U-Bahn kommt heute ein paar Minuten später als sonst. Auf der Anzeigetafel steht: „Verspätung wegen eines technischen Problems.“ Jonas seufzt leise und schaut auf die Uhr.",
      "Neben ihm steht eine ältere Frau mit einem großen Einkaufskorb. Sie lächelt Jonas an und sagt: „Immer das Gleiche am Montagmorgen, oder?“ Jonas nickt und antwortet: „Ja, ich hoffe nur, dass ich noch rechtzeitig zur Arbeit komme.“",
      "Als die U-Bahn endlich einfährt, steigen viele Leute gleichzeitig ein. Es ist eng, aber Jonas findet einen Platz in der Nähe der Tür. Er hört die Durchsage: „Nächster Halt: Alexanderplatz. Bitte achten Sie auf Ihre persönlichen Gegenstände.“",
      "Jonas nimmt sein Handy aus der Tasche und liest die Nachricht von seinem Chef: „Kein Stress, Jonas. Wenn du ein paar Minuten zu spät kommst, ist das in Ordnung.“ Jonas lächelt und lehnt sich ein wenig entspannter an die Tür.",
    ],
    hints: [
      "Worum geht es? Jemand wartet morgens auf die U-Bahn, die verspätet ist.",
      "Beachte den kurzen Smalltalk und wie sich Jonas fühlt.",
      "Achte auf die wichtigen Infos in der Durchsage.",
      "Was ändert sich, nachdem Jonas die Nachricht von seinem Chef liest?",
    ],
  },
  questions: [
    {
      id: "q1",
      prompt: "Warum ist die U-Bahn verspätet?",
      type: "mcq",
      options: [
        "Wegen eines technischen Problems",
        "Wegen des Wetters",
        "Weil der Fahrer zu spät kommt",
        "Wegen eines Unfalls am Gleis",
      ],
      correctIndex: 0,
    },
    {
      id: "q2",
      prompt: "Wie fühlt sich Jonas, als er die Nachricht von seinem Chef liest?",
      type: "mcq",
      options: ["Gestresst", "Wütend", "Entspannt", "Verwirrt"],
      correctIndex: 2,
    },
    {
      id: "q3",
      prompt: "Beschreibe in einem Satz, was in der U-Bahn-Szene passiert.",
      type: "short",
      idealAnswer: "Jonas wartet auf eine verspätete U-Bahn, fährt dann mit vielen anderen Fahrgästen los und entspannt sich, nachdem sein Chef ihm schreibt, dass eine kleine Verspätung kein Problem ist.",
    },
  ],
  evaluate: (questions, answers) => {
    let score = 0;
    const details: Record<string, ReadEvaluationDetail> = {};
    let total = 0;

    questions.forEach((q) => {
      total += 1;
      if (q.type === "mcq") {
        const given = answers[q.id];
        const correct = String(q.correctIndex);
        const isCorrect = given === correct;
        if (isCorrect) {
          score += 34;
        }
        details[q.id] = {
          correct: isCorrect,
          correctIndex: q.correctIndex,
        };
      } else if (q.type === "short") {
        const given = answers[q.id] ?? "";
        const isSomeAnswer = given.trim().length > 0;
        if (isSomeAnswer) {
          score += 32;
        }
        details[q.id] = {
          correct: isSomeAnswer,
          idealAnswer: q.idealAnswer,
        };
      }
    });

    if (score > 100) {
      score = 100;
    }

    const focusAreas: string[] = [];
    if (score < 80) focusAreas.push("Leseverständnis im Detail");
    if (!details["q1"]?.correct) focusAreas.push("Ursachen im Text erkennen");
    if (!details["q2"]?.correct) focusAreas.push("Gefühle von Figuren verstehen");
    if (!details["q3"]?.correct) focusAreas.push("Zusammenfassung auf Deutsch schreiben");

    const summary =
      score >= 80
        ? "Sehr gut gemacht. Du verstehst die Situation schon ziemlich sicher."
        : "Gute Basis, aber es gibt noch ein paar Punkte, die du genauer üben kannst.";

    return {
      score,
      summary,
      focusAreas,
      details,
    };
  },
};

const mockSessions: ReadSessionSummary[] = [
  {
    id: "s1",
    title: "Morgens in der U-Bahn",
    date: "Heute",
    status: "In progress",
  },
  {
    id: "s2",
    title: "Im Supermarkt",
    date: "Gestern",
    status: "Completed",
  },
  {
    id: "s3",
    title: "Beim Arzt",
    date: "Letzte Woche",
    status: "Completed",
  },
];

export function fetchMockReadLesson(): ReadLesson {
  return mockLesson;
}

export function fetchMockReadSessions(): ReadSessionSummary[] {
  return mockSessions;
}

