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

const TypeScriptChallenge: React.FC = () => {
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
    <div className="max-w-2xl mx-auto p-6 bg-gray-100 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-center">
        TypeScript Type Challenge
      </h1>

      {gameCompleted ? (
        <div className="bg-green-100 p-6 rounded-lg text-center">
          <h2 className="text-2xl font-bold text-green-800 mb-4">
            🎉 Congratulations! 🎉
          </h2>
          <p className="text-lg mb-4">
            You've completed all the TypeScript type challenges!
          </p>
          <p className="mb-6">Total attempts: {attempts}</p>
          <button
            onClick={handleReset}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Play Again
          </button>
        </div>
      ) : (
        <div className="mb-6 bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold">
              Level {currentLevel + 1} of {challenges.length}
            </h2>
            <span className="text-sm text-gray-500">Attempts: {attempts}</span>
          </div>
          <p className="text-lg mb-2">
            Enter a value that satisfies this type:
          </p>
          <div className="bg-gray-800 text-white p-3 rounded font-mono mb-4">
            {currentChallenge.typeDescription}
          </div>

          <form onSubmit={handleSubmit} className="mb-4">
            <div className="mb-4">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded font-mono"
                placeholder="Enter your answer here..."
                autoFocus
              />
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex-1"
              >
                Submit
              </button>
              <button
                type="button"
                onClick={toggleHint}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
              >
                {showHint ? "Hide Hint" : "Show Hint"}
              </button>
            </div>
          </form>

          {showHint && (
            <div className="bg-yellow-100 p-3 rounded">
              <h3 className="font-semibold">Hint:</h3>
              <ul className="list-disc pl-5">
                {currentChallenge.hints.map((hint, index) => (
                  <li key={index}>{hint}</li>
                ))}
              </ul>
            </div>
          )}

          {feedback && (
            <div
              className={`mt-4 p-3 rounded ${
                feedback.startsWith("Correct") ? "bg-green-100" : "bg-red-100"
              }`}
            >
              {feedback}
            </div>
          )}
        </div>
      )}

      <div className="text-center text-sm text-gray-600 mt-6">
        <p>TypeScript Type Challenge Game</p>
      </div>
      <DisqusChat />
    </div>
  );
};

export default TypeScriptChallenge;
