import React, { useEffect, useRef, useState, useCallback } from "react";
import * as ts from "typescript";
import type { ChallengeEditorProps, ChallengeMode } from "./App";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import "monaco-editor/esm/vs/language/typescript/monaco.contribution";
import "monaco-editor/esm/vs/editor/editor.main";
import { MONADO_EDITOR_CONFIGURATIONS } from "./constants/monaco";

const TYPESCRIPT_VERSION = "5.4.5";

export type Challenge = {
  id: string;
  title: string;
  description: string;
  mode: ChallengeMode;
  typeDefinition?: string;
  valueDefinition?: string;
  hints?: string[];
};

const getStarterCode = () => `
const solution : Expected = `;

const editorOptions: monaco.editor.IStandaloneEditorConstructionOptions =
  MONADO_EDITOR_CONFIGURATIONS;

const getTypeScriptLibContent = async (
  libFileName: string
): Promise<string> => {
  const url = `https://unpkg.com/typescript@${TYPESCRIPT_VERSION}/lib/${libFileName}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `HTTP error! status: ${response.status} for ${libFileName}`
      );
    }
    const content = await response.text();
    return content;
  } catch (error) {
    console.error(
      `Failed to fetch TypeScript lib file: ${libFileName} from ${url}`,
      error
    );
    return "";
  }
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
  const [isMonacoReady, setIsMonacoReady] = useState(false);
  const [tsLibFiles, setTsLibFiles] = useState<Record<string, string>>({});
  const [isLoadingLibs, setIsLoadingLibs] = useState(true);

  const editorRef = useRef<HTMLDivElement>(null);
  const monacoEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(
    null
  );
  const debounceTimerRef = useRef<number | null>(null);
  const isCompletedRef = useRef<boolean>(false);

  const checkSolution = useCallback(() => {
    if (!monacoEditorRef.current || !isMonacoReady || isLoadingLibs) {
      return;
    }

    const userCode = monacoEditorRef.current.getValue();

    if (
      !userCode.includes("const solution") ||
      !userCode.includes(": Expected")
    ) {
      return;
    }

    try {
      const utilityTypeDefs = tsLibFiles["lib.utility-types.d.ts"] || "";

      const codeToValidate = `
        // --- TypeScript Standard Libraries (provided via host.getScriptSnapshot) ---

        // --- Custom Utility Types ---
        ${utilityTypeDefs}

        // --- Challenge Definition ---
        ${challenge.typeDefinition || "type Expected = any;"}

        // --- User Code ---
        ${userCode}

        // --- Validation Helper (Optional) ---
        // This helps ensure 'solution' is assignable to 'Expected'
        // Note: The Language Service does this implicitly, but explicit check can be clearer
        // function __validateSolution(val: Expected) {};
        // __validateSolution(solution);
      `;

      const filename = "solution.ts";

      const languageServiceHost: ts.LanguageServiceHost = {
        getCompilationSettings: () => ({
          strict: true,
          target: ts.ScriptTarget.ES2022,
          lib: Object.keys(tsLibFiles).map((name) => `ts:filename/${name}`),
          module: ts.ModuleKind.CommonJS,
          noEmit: true,
        }),
        getScriptFileNames: () => [
          filename,
          ...Object.keys(tsLibFiles).map((name) => `ts:filename/${name}`),
        ],
        getScriptVersion: (_fileName) => "1",
        getScriptSnapshot: (fileName) => {
          if (fileName === filename) {
            return ts.ScriptSnapshot.fromString(codeToValidate);
          }
          const libName = fileName.startsWith("ts:filename/")
            ? fileName.substring("ts:filename/".length)
            : fileName;
          if (tsLibFiles[libName]) {
            return ts.ScriptSnapshot.fromString(tsLibFiles[libName]);
          }
          return undefined;
        },
        getCurrentDirectory: () => "/",
        getDefaultLibFileName: (options) => {
          const defaultLib = "ts:filename/lib.es2022.d.ts";
          return tsLibFiles["lib.es2022.d.ts"]
            ? defaultLib
            : ts.getDefaultLibFileName(options);
        },
        fileExists: (path) => {
          if (path === filename) return true;
          const libName = path.startsWith("ts:filename/")
            ? path.substring("ts:filename/".length)
            : path;
          return !!tsLibFiles[libName];
        },
        readFile: (path) => {
          if (path === filename) return codeToValidate;
          const libName = path.startsWith("ts:filename/")
            ? path.substring("ts:filename/".length)
            : path;
          return tsLibFiles[libName] || undefined;
        },
        readDirectory: () => [],
        directoryExists: () => true,
        getDirectories: () => [],
      };

      const languageService = ts.createLanguageService(
        languageServiceHost,
        ts.createDocumentRegistry()
      );

      const diagnostics = [
        ...languageService.getSyntacticDiagnostics(filename),
        ...languageService.getSemanticDiagnostics(filename),
      ];

      languageService.dispose();

      if (diagnostics.length > 0) {
        const formattedDiagnostics = diagnostics
          .map((diagnostic) => {
            const message = ts.flattenDiagnosticMessageText(
              diagnostic.messageText,
              "\n"
            );
            let lineInfo = "";
            if (diagnostic.file && diagnostic.start !== undefined) {
              try {
                const { line, character } =
                  diagnostic.file.getLineAndCharacterOfPosition(
                    diagnostic.start
                  );
                const prependedLines =
                  (utilityTypeDefs.match(/\n/g)?.length || 0) +
                  (challenge.typeDefinition?.match(/\n/g)?.length || 0) +
                  4;
                const adjustedLine = Math.max(1, line + 1 - prependedLines);
                lineInfo = `(aprox linha ${adjustedLine}, col ${
                  character + 1
                })`;
              } catch (e) {}
            }
            return `Erro ${lineInfo}: ${message}`;
          })
          .join("\n");

        setResult({
          success: false,
          message: `Erro(s) de tipo encontrado(s):\n${formattedDiagnostics}`,
        });
        return;
      }

      setResult({
        success: true,
        message: "Parabéns! Sua solução passa na verificação de tipo!",
      });

      if (!isCompletedRef.current) {
        isCompletedRef.current = true;
        onComplete(challenge.id);
      }
    } catch (error: any) {
      console.error("Erro durante a validação TypeScript:", error);
      setResult({
        success: false,
        message: `Erro inesperado na validação: ${
          error?.message || String(error)
        }`,
      });
    }
  }, [challenge, onComplete, tsLibFiles, isMonacoReady, isLoadingLibs]);

  useEffect(() => {
    const loadLibs = async () => {
      setIsLoadingLibs(true);
      const libFiles = [
        "lib.es5.d.ts",
        "lib.es2015.core.d.ts",
        "lib.es2015.promise.d.ts",
        "lib.es2016.array.include.d.ts",
        "lib.es2022.d.ts",
        "lib.dom.d.ts",
        "lib.dom.iterable.d.ts",
      ];

      const libContents: Record<string, string> = {};

      try {
        console.log("Starting fetch for TypeScript libs...");
        const settledPromises = await Promise.allSettled(
          libFiles.map(async (libFile) => ({
            name: libFile,
            content: await getTypeScriptLibContent(libFile),
          }))
        );

        settledPromises.forEach((result) => {
          if (result.status === "fulfilled" && result.value.content) {
            libContents[result.value.name] = result.value.content;
          } else if (result.status === "rejected") {
            console.error(`Failed to load lib file:`, result.reason);
          }
        });

        setTsLibFiles(libContents);
        console.log("TypeScript lib fetching complete.");
      } catch (error) {
        console.error("Failed to load TypeScript lib files:", error);
      } finally {
        setIsLoadingLibs(false);
      }
    };

    loadLibs();
  }, []);

  useEffect(() => {
    if (isLoadingLibs || !monaco.languages.typescript) {
      if (!isLoadingLibs) {
        console.warn("Monaco TypeScript language features not available yet.");
      }
      return;
    }

    console.log("Configuring Monaco TypeScript defaults...");

    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      strict: true,
      target: monaco.languages.typescript.ScriptTarget.ESNext,
      module: monaco.languages.typescript.ModuleKind.ESNext,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      lib: ["dom", "es2022", "esnext"],
      allowNonTsExtensions: true,
      noEmit: true,
    });

    monaco.languages.typescript.typescriptDefaults.setExtraLibs([]);
    Object.entries(tsLibFiles).forEach(([filePath, content]) => {
      if (content && content.trim()) {
        const uri = `ts:filename/${filePath}`;
        monaco.languages.typescript.typescriptDefaults.addExtraLib(
          content,
          uri
        );
      } else {
        console.warn(`Skipping empty lib content for: ${filePath}`);
      }
    });

    console.log("Monaco TypeScript defaults configured.");
    setIsMonacoReady(true);
  }, [isLoadingLibs, tsLibFiles]);

  useEffect(() => {
    if (editorRef.current && isMonacoReady && !monacoEditorRef.current) {
      console.log("Creating Monaco Editor instance...");

      monacoEditorRef.current = monaco.editor.create(editorRef.current, {
        value: "",
        language: "typescript",
        theme: "vs-dark",
        automaticLayout: true,
        ...editorOptions,
      });

      const changeListener = monacoEditorRef.current.onDidChangeModelContent(
        () => {
          if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
          }
          debounceTimerRef.current = window.setTimeout(() => {
            checkSolution();
          }, 750);
        }
      );

      checkSolution();

      return () => {
        console.log("Disposing Monaco Editor instance...");
        changeListener.dispose();
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        monacoEditorRef.current?.dispose();
        monacoEditorRef.current = null;
        console.log("Monaco Editor disposed.");
      };
    }
  }, [isMonacoReady, checkSolution, challenge.typeDefinition]);

  useEffect(() => {
    if (monacoEditorRef.current && isMonacoReady) {
      console.log(`Challenge changed to: ${challenge.id}. Resetting editor.`);

      const newStarterCode = `

${getStarterCode()}
       `.trim();

      monacoEditorRef.current.setValue(newStarterCode);
      monacoEditorRef.current.setScrollTop(0);
      monacoEditorRef.current.focus();

      setResult(null);
      setShowHint(false);
      isCompletedRef.current = false;

      checkSolution();
    }
  }, [challenge, isMonacoReady, checkSolution]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-800 text-white">
      <div className="p-4 border-b border-gray-700 flex-shrink-0">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">{challenge.title}</h2>
          <span className="bg-blue-600 text-blue-100 px-2 py-1 rounded text-xs font-medium">
            {challenge.mode || "Type Challenge"}
          </span>
        </div>
        <p className="text-gray-300 text-sm mb-3">{challenge.description}</p>

        <div className="mt-2 p-3 bg-gray-900 rounded-md font-mono text-sm overflow-x-auto">
          <h3 className="text-gray-400 text-xs mb-1">Tipo Esperado:</h3>
          <pre className="text-cyan-300">
            <code>{challenge.typeDefinition || "type Expected = any;"}</code>
          </pre>
        </div>

        {challenge.hints?.length && challenge.hints.length > 0 && (
          <div className="mt-3">
            <button
              onClick={() => setShowHint(!showHint)}
              className="text-yellow-400 hover:text-yellow-300 underline text-sm focus:outline-none"
            >
              {showHint
                ? "Esconder Dica"
                : `Mostrar Dica (${challenge.hints.length})`}
            </button>
            {showHint && (
              <div className="mt-2 p-3 bg-yellow-900 bg-opacity-40 rounded-md text-yellow-200 text-sm space-y-1">
                {challenge.hints.map((hint, index) => (
                  <p key={index}>💡 {hint}</p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-hidden relative">
        {isLoadingLibs && (
          <div className="absolute inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-10">
            <p className="text-lg text-gray-300">
              Carregando bibliotecas TypeScript...
            </p>
          </div>
        )}
        <div ref={editorRef} className="absolute top-0 left-0 h-full w-full" />
      </div>

      <div className="p-4 border-t border-gray-700 flex-shrink-0 min-h-[80px]">
        {result ? (
          <div
            className={`p-3 rounded-md ${
              result.success
                ? "bg-green-800 bg-opacity-60 text-green-100"
                : "bg-red-800 bg-opacity-60 text-red-100"
            }`}
          >
            <div className="flex items-start">
              <span className="mr-2 text-lg mt-px">
                {result.success ? "✅" : "❌"}
              </span>
              <pre className="font-mono text-sm whitespace-pre-wrap flex-1 break-words">
                {result.message}
              </pre>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-md bg-gray-700 text-gray-400 text-sm italic">
            {isLoadingLibs
              ? "Carregando..."
              : "Os resultados da validação aparecerão aqui..."}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChallengeEditor;
