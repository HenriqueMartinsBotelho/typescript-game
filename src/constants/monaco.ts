import type * as monaco from "monaco-editor/esm/vs/editor/editor.api";

export const MONADO_EDITOR_CONFIGURATIONS: monaco.editor.IStandaloneEditorConstructionOptions =
  {
    minimap: { enabled: false },
    wordWrap: "on",
    fontSize: 14,
    scrollBeyondLastLine: false,
    automaticLayout: true,
    tabSize: 2,
    renderWhitespace: "boundary",
    contextmenu: true,
    theme: "vs-dark",
  };
