
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
      // Example: { name: 'Alice', age: 30 }
    ],
  },
  {
    id: "2",
    title: "Mixed Array",
    description: "Create a value that matches this type",
    mode: "value-to-type",
    typeDefinition: "type Expected = (string | number)[];",
    hints: [
      "You need an array that can contain both strings and numbers", 
      // Example: ['hello', 42, 'world', 7]
    ],
  },
  {
    id: "3",
    title: "Function Type",
    description: "Create a value that matches this function type",
    mode: "value-to-type",
    typeDefinition: "type Expected = (a: number, b: number) => number;",
    hints: [
      "Define a function that takes two numbers and returns a number", 
      // Example: const add = (a, b) => a + b;
    ],
  },
  {
    id: "4",
    title: "Nested Object",
    description: "Create a value that matches this nested object type",
    mode: "value-to-type",
    typeDefinition:
      "type Expected = { user: { id: number; details: { name: string; active: boolean } } };",
    hints: [
      "The object has a 'user' property containing an 'id' and a 'details' object", 
      // Example: { user: { id: 1, details: { name: 'Bob', active: true } } }
      "The 'details' object must have a string 'name' and a boolean 'active'", 
      // Example: { user: { id: 2, details: { name: 'Jane', active: false } } }
    ],
  },
  {
    id: "5",
    title: "Optional Properties",
    description:
      "Create a value that matches this type with optional properties",
    mode: "value-to-type",
    typeDefinition:
      "type Expected = { id: number; name?: string; email?: string };",
    hints: [
      "The 'id' is required, but 'name' and 'email' are optional", 
      // Example: { id: 10 }
      "You can include none, one, or both optional properties", 
      // Example: { id: 10, name: 'Eve', email: 'eve@example.com' }
    ],
  },
  {
    id: "6",
    title: "Union Type",
    description: "Create a value that matches this union type",
    mode: "value-to-type",
    typeDefinition: "type Expected = 'success' | 'error' | 'pending';",
    hints: [
      "The value must be one of the literal strings: 'success', 'error', or 'pending'", 
      // Example: 'success'
    ],
  },
  {
    id: "7",
    title: "Tuple Type",
    description: "Create a value that matches this tuple type",
    mode: "value-to-type",
    typeDefinition: "type Expected = [string, number, boolean];",
    hints: [
      "The array must have exactly three elements in this order: string, number, boolean", 
      // Example: ['ready', 5, true]
    ],
  },
  {
    id: "8",
    title: "Interface Implementation",
    description: "Create a value that matches this interface",
    mode: "value-to-type",
    typeDefinition:
      "interface Expected { title: string; publish: () => void; }",
    hints: [
      "The object needs a 'title' string and a 'publish' method that returns nothing", 
      // Example: { title: 'My Article', publish: () => { console.log('Published'); } }
    ],
  },
  {
    id: "9",
    title: "Generic Function",
    description: "Create a value that matches this generic function type",
    mode: "value-to-type",
    typeDefinition: "type Expected = <T>(input: T) => T;",
    hints: [
      "Define a function that takes a generic input and returns the same type", 
      // Example: const identity = <T>(input: T): T => input;
      "This is an identity function that returns its input unchanged", 
      // Example: const identity = <T>(x: T) => x;
    ],
  },
  {
    id: "10",
    title: "Readonly Object",
    description: "Create a value that matches this readonly type",
    mode: "value-to-type",
    typeDefinition:
      "type Expected = { readonly id: number; readonly name: string };",
    hints: [
      "The object must have 'id' and 'name' properties that are readonly", 
      // Example: const obj: Expected = { id: 1, name: 'Static' }
      "The structure is similar to a regular object but marked as readonly", 
      // Example: const user: Expected = { id: 123, name: 'Locked' }
    ],
  },
  {
    id: "11",
    title: "Record Utility Type",
    description: "Create a value that matches this Record type",
    mode: "value-to-type",
    typeDefinition: "type Expected = Record<string, number>;",
    hints: [
      "The object can have any string keys, but all values must be numbers", 
      // Example: { apples: 5, oranges: 3 }
    ],
  },
  {
    id: "12",
    title: "Intersection Type",
    description: "Create a value that matches this intersection type",
    mode: "value-to-type",
    typeDefinition: "type Expected = { name: string } & { age: number };",
    hints: [
      "The object must have both 'name' (string) and 'age' (number) properties", 
      // Example: { name: 'Liam', age: 25 }
      "The intersection combines properties from both types", 
      // Example: { name: 'Emma', age: 30 }
    ],
  },
  {
    id: "13",
    title: "Array of Objects",
    description: "Create a value that matches this array of objects type",
    mode: "value-to-type",
    typeDefinition: "type Expected = { id: number; value: string }[];",
    hints: [
      "The value is an array where each element is an object with 'id' and 'value'", 
      // Example: [{ id: 1, value: 'A' }, { id: 2, value: 'B' }]
    ],
  },
  {
    id: "14",
    title: "Type Alias with Union",
    description: "Create a value that matches this type alias with union",
    mode: "value-to-type",
    typeDefinition:
      "type Expected = { type: 'point'; x: number; y: number } | { type: 'line'; start: number; end: number };",
    hints: [
      "The value must be an object matching one of the union types", 
      // Example: { type: 'point', x: 5, y: 10 }
      "Either a 'point' with 'x' and 'y', or a 'line' with 'start' and 'end'", 
      // Example: { type: 'line', start: 0, end: 100 }
    ],
  },
  {
    id: "15",
    title: "Function with Optional Parameters",
    description:
      "Create a value that matches this function type with optional parameters",
    mode: "value-to-type",
    typeDefinition:
      "type Expected = (a: number, b?: string, c?: boolean) => string;",
    hints: [
      "The function must take a required number and return a string", 
      // Example: const fn = (a, b, c) => `Number is ${a}`;
      "The second and third parameters are optional (string and boolean)", 
      // Example: const fn = (a: number, b?: string, c?: boolean): string => `a=${a}, b=${b}, c=${c}`;
    ],
  },
];
;
