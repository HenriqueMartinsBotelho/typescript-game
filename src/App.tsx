import React, { useState, useCallback, useEffect } from "react";
import challenges from "./challanges";
import DisqusChat from "./DisqusChat";

export type Challenge = {
  id: number;
  typeDescription: string;
  validationCode: string;
  explanation: string;
  hints: string[];
};

const LOCAL_STORAGE_KEY = "challengeProgress";

const loadProgress = () => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (err) {
    console.error("Error loading progress:", err);
    return null;
  }
};

const saveProgress = (progress: {
  currentLevel: number;
  attempts: number;
  gameCompleted: boolean;
}) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(progress));
  } catch (err) {
    console.error("Error saving progress:", err);
  }
};

const CyberpunkTypeChallenge: React.FC = () => {
  const [currentLevel, setCurrentLevel] = useState<number>(() => {
    const progress = loadProgress();
    return progress?.currentLevel ?? 0;
  });
  const [attempts, setAttempts] = useState<number>(() => {
    const progress = loadProgress();
    return progress?.attempts ?? 0;
  });
  const [gameCompleted, setGameCompleted] = useState<boolean>(() => {
    const progress = loadProgress();
    return progress?.gameCompleted ?? false;
  });
  const [userInput, setUserInput] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");
  const [showHint, setShowHint] = useState<boolean>(false);

  const currentChallenge = challenges[currentLevel];

  useEffect(() => {
    saveProgress({ currentLevel, attempts, gameCompleted });
  }, [currentLevel, attempts, gameCompleted]);

  const handleReset = useCallback(() => {
    setCurrentLevel(0);
    setAttempts(0);
    setGameCompleted(false);
    setUserInput("");
    setFeedback("");
    setShowHint(false);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }, []);

  const evaluateInput = useCallback(() => {
    setAttempts((prev) => prev + 1);

    try {
      const value = eval(`(${userInput})`);
      const validate = new Function(
        "value",
        `return ${currentChallenge.validationCode}`
      );
      const isValid = validate(value);

      if (isValid) {
        setFeedback(`Correct! ${currentChallenge.explanation}`);

        setTimeout(() => {
          if (currentLevel < challenges.length - 1) {
            setCurrentLevel((prev) => prev + 1);
            setUserInput("");
            setFeedback("");
            setShowHint(false);
          } else {
            setGameCompleted(true);
          }
        }, 1000);
      } else {
        setFeedback(
          `Not quite right. Your input doesn't match the type ${currentChallenge.typeDescription}.`
        );
      }
    } catch (error) {
      if (error instanceof Error) {
        setFeedback(`Error evaluating your input: ${error.message}`);
      } else {
        setFeedback("Error evaluating your input.");
      }
    }
  }, [userInput, currentChallenge, currentLevel]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    evaluateInput();
  };

  const toggleHint = () => {
    setShowHint((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 flex flex-col items-center p-8">
      <div className="max-w-3xl w-full p-8 bg-gray-900 rounded-lg shadow-xl border border-green-500">
        <h1 className="text-4xl font-extrabold mb-8 text-center text-green-400 drop-shadow-lg">
          TypeScript Type Challenge
        </h1>

        {gameCompleted ? (
          <div className="bg-gray-800 p-6 rounded-lg text-center border border-green-500">
            <h2 className="text-3xl font-bold text-green-400 mb-4">
              🎉 Congratulations! 🎉
            </h2>
            <p className="text-lg mb-4 text-white">
              You've completed all the TypeScript type challenges!
            </p>
            <p className="mb-6 text-white">Total attempts: {attempts}</p>
            <button
              onClick={handleReset}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
            >
              Play Again
            </button>
          </div>
        ) : (
          <div className="mb-6 bg-gray-800 p-6 rounded-lg shadow-xl border border-cyan-500">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-cyan-400">
                Level {currentLevel + 1} of {challenges.length}
              </h2>
              <span className="text-sm text-gray-300">
                Attempts: {attempts}
              </span>
            </div>
            <p className="text-lg mb-2 text-white">
              Enter a value that satisfies this type:
            </p>
            <div className="bg-gray-700 text-white p-3 rounded font-mono mb-4 border border-cyan-500">
              {currentChallenge.typeDescription}
            </div>

            <form onSubmit={handleSubmit} className="mb-4">
              <div className="mb-4">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  className="w-full p-2 bg-gray-900 text-green-400 border border-green-500 rounded font-mono focus:outline-none focus:ring-2 focus:ring-green-400 transition"
                  placeholder="Enter your answer here..."
                  autoFocus
                />
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-600 flex-1 transition"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={toggleHint}
                  className="bg-gray-700 text-gray-300 px-4 py-2 rounded hover:bg-gray-600 transition"
                >
                  {showHint ? "Hide Hint" : "Show Hint"}
                </button>
              </div>
            </form>

            {showHint && (
              <div className="bg-gray-700 p-4 rounded border border-yellow-500">
                <h3 className="font-semibold text-yellow-300">Hint:</h3>
                <ul className="list-disc pl-5 text-yellow-300">
                  {currentChallenge.hints.map((hint, index) => (
                    <li key={index}>{hint}</li>
                  ))}
                </ul>
              </div>
            )}

            {feedback && (
              <div
                className={`mt-4 p-4 rounded border ${
                  feedback.startsWith("Correct")
                    ? "bg-gray-800 border-green-500 text-green-400"
                    : "bg-gray-800 border-red-500 text-red-400"
                }`}
              >
                {feedback}
              </div>
            )}
          </div>
        )}

        <div className="text-center text-sm text-gray-400 mt-6">
          <p>TypeScript Type Challenge Game</p>
        </div>
      </div>
      <div className="mt-8 w-full">
        <DisqusChat />
      </div>
    </div>
  );
};

export default CyberpunkTypeChallenge;
