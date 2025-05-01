import { useState, useEffect } from "react";

/**
 * TypeScript version to fetch library files from
 */
const TYPESCRIPT_VERSION = "5.4.5";

/**
 * Fetches TypeScript library content from unpkg CDN
 * @param libFileName The name of the TypeScript library file to fetch
 * @returns The content of the library file as a string
 */
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

/**
 * Standard TypeScript library files to load
 */
const DEFAULT_LIB_FILES = [
  "lib.es5.d.ts",
  "lib.es2015.core.d.ts",
  "lib.es2015.promise.d.ts",
  "lib.es2016.array.include.d.ts",
  "lib.es2022.d.ts",
  "lib.dom.d.ts",
  "lib.dom.iterable.d.ts",
  "lib.utility-types.d.ts", // Added based on usage in the component
];

/**
 * Custom hook to load TypeScript library files
 * @param additionalLibs Optional additional library files to load
 * @returns Object containing lib files content and loading state
 */
export function useTypeScriptLibs(additionalLibs: string[] = []) {
  const [tsLibFiles, setTsLibFiles] = useState<Record<string, string>>({});
  const [isLoadingLibs, setIsLoadingLibs] = useState(true);

  useEffect(() => {
    const loadLibs = async () => {
      setIsLoadingLibs(true);
      const libFilesToLoad = [...DEFAULT_LIB_FILES, ...additionalLibs];
      const libContents: Record<string, string> = {};

      try {
        console.log("Starting fetch for TypeScript libs...");
        const settledPromises = await Promise.allSettled(
          libFilesToLoad.map(async (libFile) => ({
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
  }, [additionalLibs.join(",")]); // Re-run if the list of additional libs changes

  return {
    tsLibFiles,
    isLoadingLibs,
  };
}
