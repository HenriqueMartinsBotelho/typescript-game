import { ChallengeListProps } from "./App";

const ChallengeList: React.FC<ChallengeListProps> = ({
  challenges,
  currentChallenge,
  completedChallenges,
  onSelectChallenge,
}) => (
  <div className="w-64 bg-gray-800 p-4 overflow-y-auto">
    <h2 className="text-xl font-semibold mb-4">Challenges</h2>
    <ul>
      {challenges.map((challenge) => (
        <li key={challenge.id} className="mb-2">
          <button
            onClick={() => onSelectChallenge(challenge)}
            className={`w-full text-left p-2 rounded-md flex items-center ${
              currentChallenge.id === challenge.id
                ? "bg-blue-600"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            <span>{challenge.title}</span>
            {completedChallenges.has(challenge.id) && (
              <span className="ml-auto text-green-400">✓</span>
            )}
          </button>
        </li>
      ))}
    </ul>
  </div>
);

export default ChallengeList;
