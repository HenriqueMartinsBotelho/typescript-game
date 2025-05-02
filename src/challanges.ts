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
    id: "3",
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
    id: "4",
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
    id: "5",
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
    id: "6",
    title: "Intersection Type",
    description:
      "Create a value that matches this intersection type, combining properties from two types.",
    mode: "value-to-type",
    typeDefinition:
      "type User = { id: number; name: string };\ntype Profile = { email: string; verified: boolean };\ntype Expected = User & Profile;",
    hints: [
      "The object must possess all properties defined in both the `User` type and the `Profile` type.",
      "Think about combining the required fields from each type into a single object.",
      "Example: { id: 101, name: 'Alice', email: 'alice@example.com', verified: false }",
    ],
  },
  {
    id: "7",
    title: "Conditional Type Evaluation",
    description:
      "Create a value that matches the resulting type of this conditional type.",
    mode: "value-to-type",
    typeDefinition: `
      type NonEmptyArray<T> = [T, ...T[]];

      type Check<T> = T extends { value: number }
        ? NonEmptyArray<number>
        : NonEmptyArray<string>;
        
      type Expected = Check<{ value: 10 }>;
      `,
    hints: [
      "Evaluate the conditional type `Check<T>` with the provided type `{ value: 10 }`.",
      "Does `{ value: 10 }` extend `{ value: number }`? Yes, it does.",
      "Therefore, the resulting type is the 'true' branch: `number[]`.",
      "Create an array of numbers.",
      //"Example: [1, 2, 3]",
    ],
  },
  {
    id: "8",
    title: "Generic Function with Constraints",
    description:
      "Create a function value that matches this generic function type, which includes a constraint on the generic type.",
    mode: "value-to-type",
    typeDefinition:
      "type Processable = { process: () => void };\ntype Expected = <T extends Processable>(item: T) => T;",
    hints: [
      "Define a generic function named, for example, `processItem`.",
      "The generic type `T` must have a method named `process` that takes no arguments and returns `void`.",
      "The function should accept an argument `item` of type `T`.",
      "The function should likely call the `process` method on the item and return the item itself.",
      "Example: const processItem = <T extends Processable>(item: T): T => { item.process(); return item; };",
    ],
  },
  {
    id: "9",
    title: "Utility Type - Omit",
    description:
      "Create a value that matches this type constructed using the Omit utility type.",
    mode: "value-to-type",
    typeDefinition:
      "type DetailedInfo = { id: string; timestamp: number; data: object; source: string; };\ntype Expected = Omit<DetailedInfo, 'data' | 'timestamp'>;",
    hints: [
      "The `Omit<T, K>` utility type creates a new type by removing properties `K` from type `T`.",
      "The `Expected` type will have all properties from `DetailedInfo` except for `data` and `timestamp`.",
      "Create an object containing only the `id` and `source` properties.",
      "Example: { id: 'evt-567', source: 'sensor-A' }",
    ],
  },
  {
    id: "10",
    title: "Optional Properties",
    description:
      "Create a value that matches this type with optional properties",
    mode: "value-to-type",
    typeDefinition:
      "type Expected = { name: string; age?: number; email?: string };",
    hints: [
      "The object must have a name property, while age and email are optional",
      "Example: { name: 'Bob' } or { name: 'Bob', age: 25, email: 'bob@example.com' }",
    ],
  },
  {
    id: "11",
    title: "Readonly Type",
    description: "Create a value that matches this readonly type",
    mode: "value-to-type",
    typeDefinition: "type Expected = Readonly<{ id: number; status: string }>;",
    hints: [
      "The object should have id (number) and status (string) properties",
      "The Readonly utility type makes all properties immutable",
      "Example: { id: 1, status: 'active' }",
    ],
  },
  {
    id: "12",
    title: "Record Utility Type",
    description: "Create a value that matches this Record type",
    mode: "value-to-type",
    typeDefinition:
      "type Expected = Record<'up' | 'down' | 'left' | 'right', number>;",
    hints: [
      "The object must have exactly four keys: 'up', 'down', 'left', 'right', each with a number value",
      "Example: { up: 1, down: -1, left: -1, right: 1 }",
    ],
  },
  {
    id: "13",
    title: "Mapped Type",
    description: "Create a value that matches this mapped type",
    mode: "value-to-type",
    typeDefinition:
      "type Keys = 'x' | 'y'; type Expected = { [K in Keys]: string };",
    hints: [
      "The object must have properties 'x' and 'y', both with string values",
      "Example: { x: '10px', y: '20px' }",
    ],
  },
  {
    id: "14",
    title: "Type Predicate Function",
    description: "Create a function that matches this type predicate signature",
    mode: "value-to-type",
    typeDefinition: "type Expected = (value: unknown) => value is string;",
    hints: [
      "Define a function that checks if the input is a string and returns a type predicate",
      "Example: const isString = (value: unknown): value is string => typeof value === 'string';",
    ],
  },
  {
    id: "15",
    title: "Partial Utility Type",
    description: "Create a value that matches this Partial type",
    mode: "value-to-type",
    typeDefinition:
      "type Config = { host: string; port: number; secure: boolean }; type Expected = Partial<Config>;",
    hints: [
      "The Partial utility type makes all properties optional",
      "The object can have any subset of host, port, and secure properties",
      "Example: { host: 'localhost' } or { port: 8080, secure: true }",
    ],
  },
  {
    id: "16",
    title: "Discriminated Union",
    description: "Create a value that matches this discriminated union type",
    mode: "value-to-type",
    typeDefinition: `
      type Success = { kind: 'success'; data: string };
      type Error = { kind: 'error'; message: string };
      type Expected = Success | Error;
    `,
    hints: [
      "The object must have a 'kind' property with either 'success' or 'error'",
      "If kind is 'success', include a 'data' string property",
      "If kind is 'error', include a 'message' string property",
      "Example: { kind: 'success', data: 'Completed' } or { kind: 'error', message: 'Failed' }",
    ],
  },
];
