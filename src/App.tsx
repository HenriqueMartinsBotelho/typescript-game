import { useState } from "react";
import ChallengeList from "./ChallengeList";
import ChallengeEditor from "./ChallengeEditor";
import { challenges } from "./challanges";

export type ChallengeMode = "value-to-type" | "type-to-value";

export type Challenge = {
  id: string;
  title: string;
  description: string;
  mode: ChallengeMode;
  typeDefinition?: string;
  valueDefinition?: string;
  hints?: string[];
};

export type ChallengeEditorProps = {
  challenge: Challenge;
  onComplete: (challengeId: string) => void;
};

export type ChallengeListProps = {
  challenges: Challenge[];
  currentChallenge: Challenge;
  completedChallenges: Set<string>;
  onSelectChallenge: (challenge: Challenge) => void;
};

const TypeScriptChallengeGame: React.FC = () => {
  const [currentChallenge, setCurrentChallenge] = useState<Challenge>(
    challenges[0]
  );
  const [completedChallenges, setCompletedChallenges] = useState<Set<string>>(
    new Set()
  );

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 p-4 shadow-md">
        <h1 className="text-2xl font-bold text-center">
          TypeScript Challenge Game
        </h1>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <ChallengeList
          challenges={challenges}
          currentChallenge={currentChallenge}
          completedChallenges={completedChallenges}
          onSelectChallenge={setCurrentChallenge}
        />
        <ChallengeEditor
          challenge={currentChallenge}
          onComplete={(challengeId) =>
            setCompletedChallenges((prev) => new Set(prev).add(challengeId))
          }
        />
      </div>
    </div>
  );
};

export default TypeScriptChallengeGame;
