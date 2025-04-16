import { useEffect, useRef, useState, useCallback } from "react";
import { ChallengeEditorProps, ChallengeMode } from "./App";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import * as ts from "typescript";

export type Challenge = {
  id: string;
  title: string;
  description: string;
  mode: ChallengeMode;
  typeDefinition?: string;
  valueDefinition?: string;
  hints?: string[];
};

const getStarterCode = () =>
  "// Write a value that matches the type\nconst solution = ";

const editorOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
  minimap: { enabled: false },
  wordWrap: "on",
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
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isCompletedRef = useRef<boolean>(false);
  
  // Using useCallback with challenge as a dependency ensures the function gets
  // recreated with the latest challenge whenever it changes
  const checkSolution = useCallback(() => {
    const userCode = monacoEditorRef.current?.getValue() || "";

    const solutionMatch = userCode.match(/const solution = (.*?)(;|\s*$)/);
    if (!solutionMatch || !solutionMatch[1]) {
      setResult({
        success: false,
        message: "Please provide a value for 'solution'.",
      });
      return;
    }

    const solutionValue = solutionMatch[1].trim();
    if (
      solutionValue === "" ||
      solutionValue === "null" ||
      solutionValue === "undefined"
    ) {
      setResult({
        success: false,
        message: "Solution cannot be empty, null, or undefined.",
      });
      return;
    }

    try {
      // Now challenge will always be the current one
      const validateTypeScript = `
        ${challenge.typeDefinition || ""}
        ${userCode}
        
        function validateSolution<T>(value: T): T { return value; }
        const test1 = validateSolution<Expected>(solution);
      `;

      // Create an in-memory compiler host and typescript environment
      const filename = "test.ts";
      const languageService = ts.createLanguageService(
        {
          getCompilationSettings: () => ({
            strict: true,
            noImplicitAny: true,
            target: ts.ScriptTarget.ES2015,
            module: ts.ModuleKind.CommonJS,
            lib: ["dom", "es2015"]
          }),
          getScriptFileNames: () => [filename],
          getScriptVersion: () => "1",
          getScriptSnapshot: (name) => {
            if (name === filename) {
              return ts.ScriptSnapshot.fromString(validateTypeScript);
            }
            return undefined;
          },
          getCurrentDirectory: () => "",
          getDefaultLibFileName: (options) => ts.getDefaultLibFileName(options),
          fileExists: (path) => path === filename,
          readFile: (path) => path === filename ? validateTypeScript : undefined,
          readDirectory: () => [],
          directoryExists: () => false,
          getDirectories: () => []
        },
        ts.createDocumentRegistry()
      );

      const syntacticDiagnostics = languageService.getSyntacticDiagnostics(filename);
      const semanticDiagnostics = languageService.getSemanticDiagnostics(filename);
      const diagnostics = [...syntacticDiagnostics, ...semanticDiagnostics];

      if (diagnostics.length > 0) {
        const formattedDiagnostics = diagnostics
          .map((diagnostic) => {
            return ts.flattenDiagnosticMessageText(
              diagnostic.messageText,
              "\n"
            );
          })
          .join("\n");

        setResult({
          success: false,
          message: `Type error detected:\n${formattedDiagnostics}`,
        });
        return;
      }

      if (challenge.id.includes("object")) {
        if (
          solutionValue.startsWith('"') ||
          solutionValue.match(/^[0-9]+$/) ||
          solutionValue === "true" ||
          solutionValue === "false"
        ) {
          setResult({
            success: false,
            message: "Solution must be an object, not a primitive value",
          });
          return;
        }
      }

      setResult({
        success: true,
        message: "Parabéns! Sua solução passa na verificação de tipo!",
      });
      
      if (!isCompletedRef.current) {
        isCompletedRef.current = true;
        onComplete(challenge.id);
      }
    } catch (error) {
      setResult({
        success: false,
        message: `Erro: ${
          error instanceof Error ? error.message : String(error)
        }`,
      });
    }
  }, [challenge, onComplete]); // Add challenge as a dependency for the callback

  // This effect runs only once to initialize the editor
  useEffect(() => {
    if (editorRef.current && !monacoEditorRef.current) {
      monacoEditorRef.current = monaco.editor.create(editorRef.current, {
        value: getStarterCode(),
        language: "typescript",
        theme: "vs-dark",
        ...editorOptions,
      });

      const changeDisposable = monacoEditorRef.current.onDidChangeModelContent(() => {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        
        debounceTimerRef.current = setTimeout(() => {
          checkSolution();
        }, 500); // Wait 500ms after typing stops
      });

      return () => {
        changeDisposable.dispose();
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        monacoEditorRef.current?.dispose();
        monacoEditorRef.current = null;
      };
    }
  }, [checkSolution]); // Add checkSolution as a dependency

  // Reset state when challenge changes
  useEffect(() => {
    if (monacoEditorRef.current) {
      monacoEditorRef.current.setValue(getStarterCode());
      setResult(null);
      setShowHint(false);
      isCompletedRef.current = false;
    }
  }, [challenge]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="bg-gray-800 p-4 border-b border-gray-700">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">{challenge.title}</h2>
          <span className="bg-blue-600 px-2 py-1 rounded text-sm">
            Value → Type
          </span>
        </div>
        <p className="mt-2 text-gray-300">{challenge.description}</p>
        <div className="mt-4 p-3 bg-gray-900 rounded-md font-mono text-sm">
          {challenge.typeDefinition}
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
