import React, { useEffect, useRef, useState, useCallback } from "react";
import * as ts from "typescript";
import type { ChallengeEditorProps, ChallengeMode } from "./App";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import "monaco-editor/esm/vs/language/typescript/monaco.contribution";
import "monaco-editor/esm/vs/editor/editor.main";
import "monaco-editor/esm/vs/editor/standalone/browser/inspectTokens/inspectTokens";
import * as fs from "node:fs";
import * as path from "node:path";

export type Challenge = {
  id: string;
  title: string;
  description: string;
  mode: ChallengeMode; // Ensure ChallengeMode is defined elsewhere
  typeDefinition?: string; // The 'Expected' type definition for the challenge
  valueDefinition?: string; // Not used in this version, but kept for potential future use
  hints?: string[];
};

const getStarterCode = () => "const solution : Expected = ";

const editorOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
  minimap: { enabled: false },
  wordWrap: "on",
  fontSize: 14,
  scrollBeyondLastLine: false,
  automaticLayout: true, // Adjusts editor size on container resize
  tabSize: 2,
  renderWhitespace: "boundary",
  contextmenu: true,
  theme: "vs-dark",
};

// Get TypeScript lib files from node_modules
const getTypeScriptLibContent = (libFileName: string): string => {
  try {
    // This assumes you're running in a Node.js environment
    const libPath = path.join(
      require.resolve("typescript"),
      "../../lib",
      libFileName
    );
    return fs.readFileSync(libPath, "utf8");
  } catch (error) {
    console.error(`Failed to load TypeScript lib file: ${libFileName}`, error);
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

  const editorRef = useRef<HTMLDivElement>(null); // Ref for the editor's container div
  const monacoEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(
    null // Ref for the Monaco editor instance
  );
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isCompletedRef = useRef<boolean>(false);

  // Load TypeScript lib files
  useEffect(() => {
    // These are the essential lib files for TypeScript utility types
    const libFiles = [
      "lib.es5.d.ts",
      "lib.es2015.d.ts",
      "lib.es2016.d.ts",
      "lib.es2017.d.ts",
      "lib.es2018.d.ts",
      "lib.es2019.d.ts",
      "lib.es2020.d.ts",
      "lib.es2021.d.ts",
      "lib.es2022.d.ts",
      "lib.dom.d.ts",
    ];

    const libContents: Record<string, string> = {};

    try {
      // This part will only work in a Node.js environment
      for (const libFile of libFiles) {
        libContents[libFile] = getTypeScriptLibContent(libFile);
      }
      setTsLibFiles(libContents);
    } catch (error) {
      console.error("Failed to load TypeScript lib files:", error);
      // Fallback utility types if file loading fails
      setTsLibFiles({
        "lib.utility-types.d.ts": `
          // Fallback TypeScript utility types
          type Partial<T> = { [P in keyof T]?: T[P] };
          type Required<T> = { [P in keyof T]-?: T[P] };
          type Readonly<T> = { readonly [P in keyof T]: T[P] };
          type Record<K extends keyof any, T> = { [P in K]: T };
          type Pick<T, K extends keyof T> = { [P in K]: T[P] };
          type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;
          type Exclude<T, U> = T extends U ? never : T;
          type Extract<T, U> = T extends U ? T : never;
          type NonNullable<T> = T extends null | undefined ? never : T;
          type Parameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never;
          type ConstructorParameters<T extends new (...args: any) => any> = T extends new (...args: infer P) => any ? P : never;
          type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any;
          type InstanceType<T extends new (...args: any) => any> = T extends new (...args: any) => infer R ? R : any;
          type ThisParameterType<T> = T extends (this: infer U, ...args: any[]) => any ? U : unknown;
          type OmitThisParameter<T> = T extends (this: any, ...args: infer A) => infer R ? (...args: A) => R : T;
          type ThisType<T> = { [P in keyof any]: any };
          type Uppercase<S extends string> = intrinsic;
          type Lowercase<S extends string> = intrinsic;
          type Capitalize<S extends string> = intrinsic;
          type Uncapitalize<S extends string> = intrinsic;
        `,
      });
    }
  }, []);

  useEffect(() => {
    if (!monaco.languages.typescript) {
      console.warn("Monaco TypeScript language features not available yet.");
      return;
    }

    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      strict: true,
      target: monaco.languages.typescript.ScriptTarget.ESNext,
      module: monaco.languages.typescript.ModuleKind.ESNext,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      lib: ["dom", "es2022", "esnext"],
      allowNonTsExtensions: true,
      noEmit: true,
    });

    // Add TypeScript lib files to Monaco
    Object.entries(tsLibFiles).forEach(([libFileName, libContent]) => {
      monaco.languages.typescript.typescriptDefaults.addExtraLib(
        libContent,
        libFileName
      );
    });

    console.log("Monaco TypeScript defaults configured.");
    setIsMonacoReady(true); // Signal that Monaco setup is complete

    // No cleanup needed for setCompilerOptions
  }, [tsLibFiles]);

  // 2. Core Validation Logic (using the separate `typescript` library)
  const checkSolution = useCallback(() => {
    if (!monacoEditorRef.current) {
      console.log("checkSolution called before editor is ready.");
      return;
    }

    const userCode = monacoEditorRef.current.getValue();

    // Basic extraction - might need refinement for complex scenarios
    // This assumes 'solution' is declared last or clearly separable
    const solutionMatch = userCode.match(
      /const\s+solution\s*:\s*Expected\s*=\s*(.*?)(;?\s*$)/s
    );

    if (!solutionMatch || solutionMatch[1] === undefined) {
      setResult({
        success: false,
        message:
          "Could not find 'const solution : Expected = ...;' declaration. Please ensure it's correctly formatted.",
      });
      return;
    }

    const solutionValue = solutionMatch[1].trim();

    // Prevent trivial incorrect answers
    if (
      solutionValue === "" ||
      solutionValue === "null" ||
      solutionValue === "undefined"
    ) {
      setResult({
        success: false,
        message: "Solution value cannot be empty, null, or undefined.",
      });
      return;
    }

    try {
      // Get fallback utility type definitions if we couldn't load them from files
      const utilityTypeDefs =
        tsLibFiles["lib.utility-types.d.ts"] ||
        `
        // Fallback utility types
        type Partial<T> = { [P in keyof T]?: T[P] };
        type Required<T> = { [P in keyof T]-?: T[P] };
        type Readonly<T> = { readonly [P in keyof T]: T[P] };
        type Record<K extends keyof any, T> = { [P in K]: T };
        type Pick<T, K extends keyof T> = { [P in K]: T[P] };
        type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;
        type Exclude<T, U> = T extends U ? never : T;
        type Extract<T, U> = T extends U ? T : never;
        type NonNullable<T> = T extends null | undefined ? never : T;
        type Parameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never;
        type ConstructorParameters<T extends new (...args: any) => any> = T extends new (...args: infer P) => any ? P : never;
        type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any;
        type InstanceType<T extends new (...args: any) => any> = T extends new (...args: any) => infer R ? R : any;
      `;

      // Construct the code snippet for the *separate* TS validation service
      // Include utility type definitions explicitly
      const codeToValidate = `
        // TypeScript utility types
        ${utilityTypeDefs}

        // Challenge Type Definition:
        ${
          challenge.typeDefinition || "type Expected = any;"
        } // Provide fallback

        // User's Code Snippet:
        ${userCode}

        // Helper to ensure the 'solution' constant is evaluated (optional but good practice)
        function validate<T>(value: T): T { return value; }
        const _validatedSolution = validate(solution);
      `;

      const filename = "solution.ts"; // In-memory filename

      // Create a language service host for the validation
      const languageServiceHost: ts.LanguageServiceHost = {
        getCompilationSettings: () => ({
          // Match Monaco's settings where relevant, especially 'strict' and 'target'/'lib'
          strict: true,
          target: ts.ScriptTarget.ES2022, // Must align with the features needed (e.g., for Map, Omit)
          lib: ["lib.es2022.d.ts", "lib.dom.d.ts"], // Explicitly load these libs
          module: ts.ModuleKind.CommonJS,
          noEmit: true,
        }),
        getScriptFileNames: () => [filename],
        getScriptVersion: (_fileName) => "1", // Versioning doesn't matter for this single check
        getScriptSnapshot: (fileName) => {
          if (fileName === filename) {
            return ts.ScriptSnapshot.fromString(codeToValidate);
          }

          // Provide TypeScript lib file content if available
          const libFileName = fileName.split("/").pop() ?? fileName;
          if (tsLibFiles[libFileName]) {
            return ts.ScriptSnapshot.fromString(tsLibFiles[libFileName]);
          }

          return undefined;
        },
        getCurrentDirectory: () => "/", // Root directory for resolution (usually fine for simple cases)
        getDefaultLibFileName: (options) => ts.getDefaultLibFileName(options), // Use TS's default lib file logic
        fileExists: (path) => {
          if (path === filename) return true;

          // Check if we have this lib file loaded
          const libFileName = filename.split("/").pop() ?? filename;
          return !!tsLibFiles[libFileName];
        },
        readFile: (path) => {
          if (path === filename) return codeToValidate;

          // Return lib file content if available
          const libFileName = filename.split("/").pop() ?? filename;
          return tsLibFiles[libFileName] || undefined;
        },
        readDirectory: () => [], // No directory reading needed
        directoryExists: () => false,
        getDirectories: () => [],
      };

      // Create the TS Language Service instance
      const languageService = ts.createLanguageService(
        languageServiceHost,
        ts.createDocumentRegistry()
      );

      // Get diagnostic messages (errors, warnings)
      const syntacticDiagnostics =
        languageService.getSyntacticDiagnostics(filename);
      const semanticDiagnostics =
        languageService.getSemanticDiagnostics(filename);
      const diagnostics = [...syntacticDiagnostics, ...semanticDiagnostics];

      languageService.dispose(); // Dispose the service when done

      // Process Diagnostics
      if (diagnostics.length > 0) {
        const formattedDiagnostics = diagnostics
          .map((diagnostic) => {
            const message = ts.flattenDiagnosticMessageText(
              diagnostic.messageText,
              "\n"
            );
            // Try to get line/char info (might be offset due to prepended type def)
            if (diagnostic.file && diagnostic.start !== undefined) {
              const { line, character } =
                diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
              // Adjust line number if needed based on prepended lines
              return `Error (approx line ${line + 1}, char ${
                character + 1
              }): ${message}`;
            }
            return `Error: ${message}`;
          })
          .join("\n");

        setResult({
          success: false,
          message: `Type Error(s) Found:\n${formattedDiagnostics}`,
        });
        return; // Stop if there are type errors
      }

      // --- Optional: Add Custom Validation Logic Here ---
      // Example: Check if an object type is actually an object literal
      if (
        challenge.id.includes("object") ||
        challenge.title.toLowerCase().includes("object")
      ) {
        // Basic check if it looks like a primitive - might need refinement
        if (
          solutionValue.startsWith('"') || // String literal
          solutionValue.match(/^[0-9.-]+$/) || // Number literal (simple check)
          solutionValue === "true" ||
          solutionValue === "false" || // Boolean literal
          solutionValue === "null" ||
          solutionValue === "undefined" || // Null/undefined
          solutionValue.startsWith("[") // Array literal (might be allowed depending on challenge)
        ) {
          setResult({
            success: false,
            message:
              "Validation Error: Expected an object literal like '{}', but received a primitive or array.",
          });
          return;
        }
      }
      // --- End Custom Validation ---

      // Success!
      setResult({
        success: true,
        message: "Parabéns! Sua solução passa na verificação de tipo!", // Congratulations! Your solution passes the type check!
      });

      // Trigger completion callback only once
      if (!isCompletedRef.current) {
        isCompletedRef.current = true;
        onComplete(challenge.id);
      }
    } catch (error: any) {
      console.error("Error during TypeScript validation:", error);
      setResult({
        success: false,
        message: `Validation Error: ${error?.message || String(error)}`,
      });
    }
    // Dependencies: Re-run checkSolution when challenge changes (to get new typeDefinition) or onComplete changes.
    // Note: userCode changes trigger this via the editor's onDidChangeModelContent handler.
  }, [challenge, onComplete, tsLibFiles]);

  // 3. Create Monaco Editor Instance when Ready
  useEffect(() => {
    // Only create editor if the container ref exists, Monaco is ready, and editor isn't already created
    if (editorRef.current && isMonacoReady && !monacoEditorRef.current) {
      console.log("Creating Monaco Editor instance...");

      // Inject the actual type definition into the starter code
      const starterCode = getStarterCode().replace(
        "/* Your type definition will be injected here by the challenge */",
        challenge.typeDefinition || "any" // Fallback to 'any' if undefined
      );

      monacoEditorRef.current = monaco.editor.create(editorRef.current, {
        value: starterCode,
        language: "typescript",
        theme: "vs-dark",
        ...editorOptions,
      });

      // Add listener for content changes to trigger validation (debounced)
      const changeListener = monacoEditorRef.current.onDidChangeModelContent(
        () => {
          // Clear previous timer if exists
          if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
          }
          // Set new timer
          debounceTimerRef.current = setTimeout(() => {
            console.log("Debounced change triggered validation.");
            checkSolution();
          }, 750); // Debounce time in milliseconds (adjust as needed)
        }
      );

      // Initial validation check (useful if starter code is already valid/invalid)
      checkSolution();

      // Cleanup function: Dispose listener and editor instance
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
    // Dependencies: Re-run if Monaco becomes ready or if checkSolution logic changes
  }, [isMonacoReady, checkSolution, challenge.typeDefinition]); // Add challenge.typeDefinition here

  // 4. Reset Editor and State when the Challenge Prop Changes
  useEffect(() => {
    if (monacoEditorRef.current) {
      console.log(`Challenge changed to: ${challenge.id}. Resetting editor.`);
      // Reset editor content with new type definition
      const starterCode = getStarterCode().replace(
        "/* Your type definition will be injected here by the challenge */",
        challenge.typeDefinition || "any" // Fallback to 'any' if undefined
      );
      monacoEditorRef.current.setValue(starterCode);
      monacoEditorRef.current.setScrollTop(0); // Scroll to top
      monacoEditorRef.current.focus(); // Focus the editor

      // Reset component state
      setResult(null);
      setShowHint(false);
      isCompletedRef.current = false; // Allow completion for the new challenge

      // Trigger a validation check for the new starter code
      checkSolution();
    }
    // Dependency: This effect runs only when the challenge object itself changes.
  }, [challenge, checkSolution]); // checkSolution is needed if it changes

  // --- Render ---
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-800 text-white">
      {/* 1. Header Section */}
      <div className="p-4 border-b border-gray-700 flex-shrink-0">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">{challenge.title}</h2>
          {/* Optional: Display challenge mode or other tags */}
          <span className="bg-blue-600 text-blue-100 px-2 py-1 rounded text-xs font-medium">
            {challenge.mode || "Type Challenge"}
          </span>
        </div>
        <p className="text-gray-300 text-sm mb-3">{challenge.description}</p>

        {/* Type Definition Display */}
        <div className="mt-2 p-3 bg-gray-900 rounded-md font-mono text-sm overflow-x-auto">
          <h3 className="text-gray-400 text-xs mb-1">Expected Type:</h3>
          <pre className="text-cyan-300">
            <code>{challenge.typeDefinition || "type Expected = any;"}</code>
          </pre>
        </div>

        {/* Hints Section */}
        {challenge.hints?.length && challenge.hints.length > 0 && (
          <div className="mt-3">
            <button
              onClick={() => setShowHint(!showHint)}
              className="text-yellow-400 hover:text-yellow-300 underline text-sm focus:outline-none"
            >
              {showHint ? "Hide Hint" : `Show Hint (${challenge.hints.length})`}
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

      {/* 2. Monaco Editor Section */}
      <div className="flex-1 overflow-hidden relative">
        {/* This div takes remaining space and provides positioning context */}
        <div ref={editorRef} className="absolute top-0 left-0 h-full w-full" />
        {/* The ref div fills the parent, Monaco mounts inside it */}
      </div>

      {/* 3. Result/Feedback Section */}
      <div className="p-4 border-t border-gray-700 flex-shrink-0 min-h-[80px]">
        {" "}
        {/* Give min height */}
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
              {/* Use pre for preserving whitespace and line breaks in messages */}
              <pre className="font-mono text-sm whitespace-pre-wrap flex-1 break-words">
                {result.message}
              </pre>
            </div>
          </div>
        ) : (
          // Placeholder while no result yet
          <div className="p-3 rounded-md bg-gray-700 text-gray-400 text-sm italic">
            Validation results will appear here...
          </div>
        )}
      </div>
    </div>
  );
};

export default ChallengeEditor;
