import { Challenge } from "./App";

export const challenges: Challenge[] = [
  {
    id: "1",
    title: "Simple Object",
    description: "Create a value that matches this type",
    mode: "value-to-type",
    typeDefinition: "type Expected = { name: string; age: number };",
    hints: [
      "The object should have exactly two properties: name (string) and age (number)",
    ],
  },
  {
    id: "2",
    title: "Array Type",
    description: "Create a type that matches this value",
    mode: "type-to-value",
    valueDefinition: "const example = [1, 2, 3, 4, 5];",
    hints: ["Think about how to type an array of numbers"],
  },
  {
    id: "3",
    title: "Mixed Array",
    description: "Create a value that matches this type",
    mode: "value-to-type",
    typeDefinition: "type Expected = (string | number)[];",
    hints: ["You need an array that can contain both strings and numbers"],
  },
  {
    id: "4",
    title: "Complex Object",
    description:
      "Create a type that matches this object with nested properties",
    mode: "type-to-value",
    valueDefinition:
      'const example = { user: { name: "Alice", settings: { theme: "dark", notifications: true } } };',
    hints: [
      "Use nested object types with the appropriate property names and types",
    ],
  },
  {
    id: "5",
    title: "Function Type",
    description: "Create a value that matches this function type",
    mode: "value-to-type",
    typeDefinition: "type Expected = (a: number, b: number) => number;",
    hints: ["Define a function that takes two numbers and returns a number"],
  },
];
