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
    title: "Mixed Array",
    description: "Create a value that matches this type",
    mode: "value-to-type",
    typeDefinition: "type Expected = (string | number)[];",
    hints: ["You need an array that can contain both strings and numbers"],
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
