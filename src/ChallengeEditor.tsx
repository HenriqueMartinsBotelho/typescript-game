import { useEffect, useRef, useState } from "react";
import { Challenge, ChallengeEditorProps } from "./App";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import * as ts from "typescript";

const getStarterCode = (mode: Challenge["mode"]) =>
  mode === "value-to-type"
    ? "// Write a value that matches the type\nconst solution = "
    : "// Write a type that matches the value\ntype Solution = ";

const editorOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
  minimap: { enabled: false },
  lineNumbers: "on",
  fontSize: 14,
  scrollBeyondLastLine: false,
  automaticLayout: true,
  tabSize: 2,
};

const ChallengeEditor: React.FC<ChallengeEditorProps> = ({
  challenge,
  onComplete,
}) => {
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [showHint, setShowHint] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const monacoEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(
    null
  );

  useEffect(() => {
    if (editorRef.current && !monacoEditorRef.current) {
      monacoEditorRef.current = monaco.editor.create(editorRef.current, {
        value: getStarterCode(challenge.mode),
        language: "typescript",
        theme: "vs-dark",
        ...editorOptions,
      });
    }

    return () => {
      monacoEditorRef.current?.dispose();
      monacoEditorRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (monacoEditorRef.current) {
      monacoEditorRef.current.setValue(getStarterCode(challenge.mode));
      setResult(null);
      setShowHint(false);
    }
  }, [challenge]);

  const checkSolution = () => {
    const userCode = monacoEditorRef.current?.getValue() || "";
    const fullCode =
      challenge.mode === "value-to-type"
        ? `${challenge.typeDefinition}\n${userCode}\nconst _check: Expected = solution;`
        : `${challenge.valueDefinition}\n${userCode}\nconst _check: Solution = example;`;

    try {
      const output = ts.transpileModule(fullCode, {
        compilerOptions: {
          target: ts.ScriptTarget.ES2015,
          module: ts.ModuleKind.CommonJS,
          strict: true,
          noEmitOnError: true,
        },
        reportDiagnostics: true,
      });

      if (output.diagnostics?.length) {
        setResult({
          success: false,
          message: `Type error(s):\n${output.diagnostics
            .map((d) => ts.flattenDiagnosticMessageText(d.messageText, "\n"))
            .join("\n")}`,
        });
      } else {
        setResult({
          success: true,
          message: "Great job! Your solution passes the type check!",
        });
        onComplete(challenge.id);
      }
    } catch (error) {
      setResult({
        success: false,
        message: `Error: ${
          error instanceof Error ? error.message : String(error)
        }`,
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="bg-gray-800 p-4 border-b border-gray-700">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">{challenge.title}</h2>
          <span className="bg-blue-600 px-2 py-1 rounded text-sm">
            {challenge.mode === "value-to-type"
              ? "Value → Type"
              : "Type → Value"}
          </span>
        </div>
        <p className="mt-2 text-gray-300">{challenge.description}</p>
        <div className="mt-4 p-3 bg-gray-900 rounded-md font-mono text-sm">
          {challenge.mode === "value-to-type"
            ? challenge.typeDefinition
            : challenge.valueDefinition}
        </div>
        {challenge.hints?.length && (
          <div className="mt-4">
            <button
              onClick={() => setShowHint(!showHint)}
              className="text-yellow-400 underline text-sm"
            >
              {showHint ? "Hide hint" : "Show hint"}
            </button>
            {showHint && (
              <div className="mt-2 p-3 bg-yellow-900 bg-opacity-30 rounded-md text-yellow-200 text-sm">
                <p>{challenge.hints[0]}</p>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="flex-1 overflow-hidden">
        <div
          ref={editorRef}
          className="h-full w-full border-b border-gray-700"
        />
      </div>
      <div className="bg-gray-800 p-4">
        <button
          onClick={checkSolution}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Check Solution
        </button>
        {result && (
          <div
            className={`mt-4 p-3 rounded-md ${
              result.success
                ? "bg-green-900 bg-opacity-30 text-green-200"
                : "bg-red-900 bg-opacity-30 text-red-200"
            }`}
          >
            <div className="flex items-start">
              <span className="mr-2">{result.success ? "✅" : "❌"}</span>
              <pre className="font-mono text-sm whitespace-pre-wrap">
                {result.message}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChallengeEditor;
