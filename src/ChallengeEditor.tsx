import React, { useEffect, useRef, useState, useCallback } from "react";
import * as ts from "typescript";
import type { ChallengeEditorProps, ChallengeMode } from "./App"; // Assuming these are correctly defined elsewhere
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import "monaco-editor/esm/vs/language/typescript/monaco.contribution";
import "monaco-editor/esm/vs/editor/editor.main"; // Often needed for core editor features
// Optional: 'vs/editor/standalone/browser/inspectTokens/inspectTokens' - useful for debugging tokenization
import { MONADO_EDITOR_CONFIGURATIONS } from "./constants/monaco"; // Assuming this is defined

// Define the desired TypeScript version
const TYPESCRIPT_VERSION = "5.4.5"; // Or your target version

export type Challenge = {
  id: string;
  title: string;
  description: string;
  mode: ChallengeMode;
  typeDefinition?: string;
  valueDefinition?: string; // Not used in provided code, but kept definition
  hints?: string[];
};

const getStarterCode = () => `// Definir o tipo ou valor esperado aqui
const solution : Expected = `; // Keep placeholder simple

const editorOptions: monaco.editor.IStandaloneEditorConstructionOptions =
  MONADO_EDITOR_CONFIGURATIONS; // Use your defined configurations

// --- Fetching function for TS Libs ---
const getTypeScriptLibContent = async (
  libFileName: string
): Promise<string> => {
  const url = `https://unpkg.com/typescript@${TYPESCRIPT_VERSION}/lib/${libFileName}`;
  try {
    // console.log(`Workspaceing TypeScript lib: ${url}`); // Log fetch start
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `HTTP error! status: ${response.status} for ${libFileName}`
      );
    }
    const content = await response.text();
    // console.log(`Successfully fetched ${libFileName}`); // Log fetch success
    return content;
  } catch (error) {
    console.error(
      `Failed to fetch TypeScript lib file: ${libFileName} from ${url}`,
      error
    );
    return ""; // Return empty string on failure
  }
};
// --- End Fetching Function ---

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
  const [isLoadingLibs, setIsLoadingLibs] = useState(true); // State to track lib loading

  const editorRef = useRef<HTMLDivElement>(null);
  const monacoEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(
    null
  );
  const debounceTimerRef = useRef<number | null>(null);
  const isCompletedRef = useRef<boolean>(false);

  // --- Validation Logic (using ts.createLanguageService) ---
  // Define checkSolution BEFORE using it in any effects
  const checkSolution = useCallback(() => {
    // Don't run validation if editor isn't ready or libs aren't loaded
    if (!monacoEditorRef.current || !isMonacoReady || isLoadingLibs) {
      // console.log("Validation skipped: Editor or libs not ready.");
      return;
    }

    const userCode = monacoEditorRef.current.getValue();

    // Basic check to ensure `solution` is likely defined
    if (
      !userCode.includes("const solution") ||
      !userCode.includes(": Expected")
    ) {
      // You might want a less strict check depending on challenge flexibility
      // console.log("Validation skipped: Code doesn't seem to contain 'const solution : Expected'");
      // Optionally set a specific message here if desired
      // setResult({ success: false, message: "Certifique-se de definir 'const solution : Expected = ...;'" });
      return;
    }

    try {
      // Get utility types content (fallback if needed, though should be in tsLibFiles)
      const utilityTypeDefs = tsLibFiles["lib.utility-types.d.ts"] || "";

      // Combine all code for validation
      // IMPORTANT: We prepend the actual type definition from the challenge
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

      const filename = "solution.ts"; // In-memory filename

      // --- Language Service Host Setup ---
      const languageServiceHost: ts.LanguageServiceHost = {
        getCompilationSettings: () => ({
          strict: true,
          target: ts.ScriptTarget.ES2022, // Match Monaco/project target
          lib: Object.keys(tsLibFiles).map((name) => `ts:filename/${name}`), // Tell TS which libs are available *by URI*
          module: ts.ModuleKind.CommonJS, // Or ESNext - align with project needs
          noEmit: true,
          // esModuleInterop: true,
        }),
        getScriptFileNames: () => [
          filename,
          ...Object.keys(tsLibFiles).map((name) => `ts:filename/${name}`),
        ], // Include lib file URIs
        getScriptVersion: (_fileName) => "1",
        getScriptSnapshot: (fileName) => {
          if (fileName === filename) {
            return ts.ScriptSnapshot.fromString(codeToValidate);
          }
          // Provide lib content based on the URI used in getScriptFileNames and addExtraLib
          const libName = fileName.startsWith("ts:filename/")
            ? fileName.substring("ts:filename/".length)
            : fileName;
          if (tsLibFiles[libName]) {
            return ts.ScriptSnapshot.fromString(tsLibFiles[libName]);
          }
          // console.warn(`Snapshot requested for unknown file: ${fileName}`);
          return undefined;
        },
        getCurrentDirectory: () => "/",
        getDefaultLibFileName: (options) => {
          // Attempt to provide a default based on fetched libs, e.g., es2022
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
          // readFile might be called by the service
          if (path === filename) return codeToValidate;
          const libName = path.startsWith("ts:filename/")
            ? path.substring("ts:filename/".length)
            : path;
          return tsLibFiles[libName] || undefined;
        },
        readDirectory: () => [],
        directoryExists: () => true, // Assume root exists
        getDirectories: () => [],
      };

      // --- Create and Use Language Service ---
      const languageService = ts.createLanguageService(
        languageServiceHost,
        ts.createDocumentRegistry()
      );

      const diagnostics = [
        ...languageService.getSyntacticDiagnostics(filename),
        ...languageService.getSemanticDiagnostics(filename),
      ];

      languageService.dispose(); // Clean up the service

      // --- Process Diagnostics ---
      if (diagnostics.length > 0) {
        const formattedDiagnostics = diagnostics
          .map((diagnostic) => {
            const message = ts.flattenDiagnosticMessageText(
              diagnostic.messageText,
              "\n"
            );
            // Basic error message formatting
            let lineInfo = "";
            if (diagnostic.file && diagnostic.start !== undefined) {
              try {
                // Adjust line number based on prepended content if possible
                // This is complex to get perfect due to the prepended code
                const { line, character } =
                  diagnostic.file.getLineAndCharacterOfPosition(
                    diagnostic.start
                  );
                // Heuristic: Subtract lines added before user code (utility types + challenge def)
                const prependedLines =
                  (utilityTypeDefs.match(/\n/g)?.length || 0) +
                  (challenge.typeDefinition?.match(/\n/g)?.length || 0) +
                  4; // Approx lines
                const adjustedLine = Math.max(1, line + 1 - prependedLines); // Ensure line >= 1
                lineInfo = `(aprox linha ${adjustedLine}, col ${
                  character + 1
                })`;
              } catch (e) {
                /* Ignore if position calculation fails */
              }
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

      // --- Success ---
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
    // Dependencies for the validation callback
  }, [challenge, onComplete, tsLibFiles, isMonacoReady, isLoadingLibs]);

  // --- Effect 1: Fetch TypeScript Libs ---
  useEffect(() => {
    const loadLibs = async () => {
      setIsLoadingLibs(true); // Start loading
      const libFiles = [
        // Choose the libs matching your target environment and compilerOptions
        "lib.es5.d.ts",
        "lib.es2015.core.d.ts",
        "lib.es2015.promise.d.ts", // Example: specific ES2015 features
        "lib.es2016.array.include.d.ts",
        // ... include others like es2017, es2018, ... es2022, esnext
        "lib.es2022.d.ts", // Full ES2022
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
        // Handle initialization failure (e.g., show an error message to user)
      } finally {
        setIsLoadingLibs(false); // Finish loading
      }
    };

    loadLibs();
  }, []); // Run once on mount

  // --- Effect 2: Configure Monaco Defaults once Libs are Ready ---
  useEffect(() => {
    // Only configure Monaco if libs are loaded and Monaco's TS language features are available
    if (isLoadingLibs || !monaco.languages.typescript) {
      if (!isLoadingLibs) {
        // Only warn if libs are loaded but TS features aren't ready yet
        console.warn("Monaco TypeScript language features not available yet.");
      }
      return;
    }

    console.log("Configuring Monaco TypeScript defaults...");

    // Set compiler options *before* adding extra libs
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      strict: true,
      target: monaco.languages.typescript.ScriptTarget.ESNext, // Align with latest available generally
      module: monaco.languages.typescript.ModuleKind.ESNext, // Use ES Modules
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs, // Standard resolution
      lib: ["dom", "es2022", "esnext"], // **Crucial**: List the 'lib' keys Monaco should use
      allowNonTsExtensions: true,
      noEmit: true,
      // Add other options as needed:
      // esModuleInterop: true,
      // skipLibCheck: true, // Can sometimes help if lib issues persist, but hides potential problems
    });

    // Add the fetched lib files to Monaco
    // Clear existing extra libs first to avoid duplicates if this effect re-runs
    monaco.languages.typescript.typescriptDefaults.setExtraLibs([]);
    Object.entries(tsLibFiles).forEach(([filePath, content]) => {
      if (content && content.trim()) {
        // Only add non-empty libs
        const uri = `ts:filename/${filePath}`; // Use a unique URI scheme
        // console.log(`Adding lib to Monaco: ${uri}`); // Log adding lib
        monaco.languages.typescript.typescriptDefaults.addExtraLib(
          content,
          uri // Provide a unique path/URI for the lib
        );
      } else {
        console.warn(`Skipping empty lib content for: ${filePath}`);
      }
    });

    console.log("Monaco TypeScript defaults configured.");
    setIsMonacoReady(true); // Signal Monaco is fully configured

    // Rerun this effect if libs finish loading or if the loaded lib files change
  }, [isLoadingLibs, tsLibFiles]);

  // --- Effect 3: Create Monaco Editor Instance ---
  useEffect(() => {
    // Ensure container exists, Monaco is configured, and editor isn't already created
    if (editorRef.current && isMonacoReady && !monacoEditorRef.current) {
      console.log("Creating Monaco Editor instance...");

      // Inject the actual type definition into the starter code placeholder
      const actualStarterCode = `
// Definição do tipo esperado (não edite esta linha):
${challenge.typeDefinition || "type Expected = any;"} // Provide fallback

${getStarterCode()}
       `.trim(); // Use trim() to remove leading/trailing whitespace

      monacoEditorRef.current = monaco.editor.create(editorRef.current, {
        value: actualStarterCode,
        language: "typescript",
        theme: "vs-dark", // Or your preferred theme
        automaticLayout: true, // Ensures editor resizes correctly
        ...editorOptions, // Spread your custom options
      });

      // --- Debounced Validation on Change ---
      const changeListener = monacoEditorRef.current.onDidChangeModelContent(
        () => {
          if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
          }
          debounceTimerRef.current = window.setTimeout(() => {
            // console.log("Debounced change triggered validation."); // Log validation trigger
            checkSolution();
          }, 750); // Adjust debounce time as needed
        }
      );

      // Initial validation check
      checkSolution();

      // --- Cleanup Function ---
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
    // Rerun if Monaco becomes ready or if checkSolution logic changes (due to challenge change)
  }, [isMonacoReady, checkSolution, challenge.typeDefinition]); // Include typeDefinition

  // --- Effect 4: Reset Editor on Challenge Change ---
  useEffect(() => {
    if (monacoEditorRef.current && isMonacoReady) {
      // Ensure editor exists and Monaco is ready
      console.log(`Challenge changed to: ${challenge.id}. Resetting editor.`);

      // Inject the new type definition
      const newStarterCode = `
// Definição do tipo esperado (não edite esta linha):
${challenge.typeDefinition || "type Expected = any;"}

${getStarterCode()}
       `.trim();

      monacoEditorRef.current.setValue(newStarterCode);
      monacoEditorRef.current.setScrollTop(0); // Scroll to top
      monacoEditorRef.current.focus(); // Focus editor

      // Reset component state
      setResult(null);
      setShowHint(false);
      isCompletedRef.current = false; // Allow completion for the new challenge

      // Trigger validation for the new starter code
      checkSolution();
    }
    // This effect runs when the challenge object itself changes.
  }, [challenge, isMonacoReady, checkSolution]); // Add isMonacoReady and checkSolution dependency

  // --- Render Component ---
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-800 text-white">
      {/* Header Section */}
      <div className="p-4 border-b border-gray-700 flex-shrink-0">
        {/* ... (header content as before: title, description, typeDefinition, hints) ... */}
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

      {/* Monaco Editor Section */}
      <div className="flex-1 overflow-hidden relative">
        {/* Loading Indicator */}
        {isLoadingLibs && (
          <div className="absolute inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-10">
            <p className="text-lg text-gray-300">
              Carregando bibliotecas TypeScript...
            </p>
          </div>
        )}
        {/* Editor container */}
        <div ref={editorRef} className="absolute top-0 left-0 h-full w-full" />
      </div>

      {/* Result/Feedback Section */}
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
