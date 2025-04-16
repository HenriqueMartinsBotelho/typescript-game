import { useEffect, useState } from "react";
import ChallengeList from "./ChallengeList";
import ChallengeEditor from "./ChallengeEditor";
import { challenges } from "./challanges";

const TypeScriptChallengeGame: React.FC = () => {
  const [completedChallenges, setCompletedChallenges] = useState<Set<string>>(() => {
    try {
      const savedProgress = localStorage.getItem("completedChallenges");
      return savedProgress ? new Set(JSON.parse(savedProgress)) : new Set();
    } catch (error) {
      console.error("Failed to load completed challenges from localStorage:", error);
      return new Set();
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(
        "completedChallenges",
        JSON.stringify([...completedChallenges])
      );
    } catch (error) {
      console.error("Failed to save completed challenges to localStorage:", error);
    }
  }, [completedChallenges]);

  const [currentChallenge, setCurrentChallenge] = useState(challenges[0]);

  const handleChallengeComplete = (challengeId: string) => {
    const updatedCompletedChallenges = new Set(completedChallenges).add(challengeId);
    setCompletedChallenges(updatedCompletedChallenges);
    
    const currentIndex = challenges.findIndex(challenge => challenge.id === challengeId);
    const nextIndex = currentIndex + 1;
    
    if (nextIndex < challenges.length) {
      setCurrentChallenge(challenges[nextIndex]);
    }
  };

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
          onComplete={handleChallengeComplete}
        />
      </div>
    </div>
  );
};

export default TypeScriptChallengeGame;
