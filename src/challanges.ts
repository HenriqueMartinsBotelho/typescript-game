import { Challenge } from "./App";

const challenges: Challenge[] = [
  {
    id: 1,
    typeDescription: "string",
    validationCode: 'typeof value === "string"',
    explanation:
      'A string is a sequence of characters, like "hello" or "typescript".',
    hints: [
      "Try enclosing some text in quotes",
      'Examples: "hello", "world", ""',
    ],
  },
  {
    id: 2,
    typeDescription: "number",
    validationCode: 'typeof value === "number" && !isNaN(value)',
    explanation: "A number is any numeric value, like 42 or 3.14.",
    hints: [
      "Try a simple digit like 5",
      "No quotes needed for numbers",
      "Examples: 42, 3.14, 0",
    ],
  },
  {
    id: 3,
    typeDescription: "boolean",
    validationCode: 'typeof value === "boolean"',
    explanation: "A boolean can only be true or false.",
    hints: [
      "Only two possible values",
      "No quotes needed",
      "Examples: true, false",
    ],
  },
  {
    id: 4,
    typeDescription: "string[]",
    validationCode:
      'Array.isArray(value) && value.every(item => typeof item === "string")',
    explanation: "An array of strings is a collection of string values.",
    hints: [
      "Use square brackets and commas",
      "Each item needs quotes",
      'Example: ["a", "b", "c"]',
    ],
  },
  {
    id: 5,
    typeDescription: "{ name: string, age: number }",
    validationCode:
      'typeof value === "object" && value !== null && typeof value.name === "string" && typeof value.age === "number" && !isNaN(value.age)',
    explanation:
      "An object with a name property of type string and an age property of type number.",
    hints: [
      "Use curly braces",
      'Format: { name: "value", age: number }',
      'Example: { name: "John", age: 30 }',
    ],
  },
  {
    id: 6,
    typeDescription: "(x: number) => number",
    validationCode:
      'typeof value === "function" && typeof value(5) === "number" && !isNaN(value(5))',
    explanation:
      "A function that takes a number parameter and returns a number.",
    hints: [
      "Use arrow function syntax",
      "Make sure it returns a number",
      "Example: (x) => x * 2",
    ],
  },
  {
    id: 7,
    typeDescription: "number | string",
    validationCode: 'typeof value === "number" || typeof value === "string"',
    explanation: "A union type that can be either a number or a string.",
    hints: [
      "You can provide either a number or a string",
      'Examples: 42 or "hello"',
    ],
  },
  {
    id: 8,
    typeDescription: "null",
    validationCode: "value === null",
    explanation:
      "The null value represents an intentional absence of any object value.",
    hints: ["Just one possible value", "It's not a string or undefined"],
  },
  {
    id: 9,
    typeDescription: "unknown",
    validationCode: "true",
    explanation:
      "The unknown type can be any value, but requires type checking before use.",
    hints: [
      "Anything will work here",
      "This type is used for values we don't know yet",
    ],
  },
  {
    id: 10,
    typeDescription: "Map<string, number>",
    validationCode:
      'value instanceof Map && Array.from(value.entries()).every(([k, v]) => typeof k === "string" && typeof v === "number")',
    explanation: "A Map with string keys and number values.",
    hints: [
      "Use new Map()", //  'new Map([["a", 1], ["b", 2]])',
    ],
  },
  {
    id: 11,
    typeDescription: "readonly [string, number, boolean]",
    validationCode:
      'Array.isArray(value) && value.length === 3 && typeof value[0] === "string" && typeof value[1] === "number" && typeof value[2] === "boolean"',
    explanation:
      "A readonly tuple with exactly three elements of specific types.",
    hints: [
      "Use square brackets with exactly 3 items",
      "Order matters: string, then number, then boolean",
      'Example: ["name", 42, true]',
    ],
    // Answer: ["hello", 42, true]
  },
  {
    id: 12,
    typeDescription: "<T>(arg: T) => T[]",
    validationCode:
      'typeof value === "function" && Array.isArray(value("test")) && value("test")[0] === "test" && Array.isArray(value(123)) && value(123)[0] === 123',
    explanation:
      "A generic function that takes any type and returns an array of that type.",
    hints: [
      "Your function should work with any argument type",
      "Return an array containing the argument",
      "Example: (x) => [x]",
    ],
    // Answer: (x) => [x]
  },
  {
    id: 13,
    typeDescription: "Record<string, boolean>",
    validationCode:
      'typeof value === "object" && value !== null && !Array.isArray(value) && Object.values(value).every(v => typeof v === "boolean")',
    explanation: "An object with string keys and boolean values.",
    hints: [
      "Use an object with only boolean values",
      "All properties must be true or false",
      "Example: { isActive: true, isLoggedIn: false }",
    ],
    // Answer: { prop1: true, prop2: false }
  },
  {
    id: 14,
    typeDescription: "Set<number>",
    validationCode:
      'value instanceof Set && Array.from(value.values()).every(v => typeof v === "number")',
    explanation: "A Set containing only number values.",
    hints: [
      "Use new Set()",
      "Every value must be a number",
      "Example: new Set([1, 2, 3])",
    ],
    // Answer: new Set([1, 2, 3])
  },
  {
    id: 15,
    typeDescription: "Promise<string>",
    validationCode:
      'value instanceof Promise && typeof (async () => { const result = await value; return typeof result === "string"; })() === "object"',
    explanation: "A Promise that resolves to a string value.",
    hints: [
      "Use Promise.resolve()",
      "The resolved value must be a string",
      'Example: Promise.resolve("data")',
    ],
    // Answer: Promise.resolve("hello")
  },
  {
    id: 16,
    typeDescription: "(args: ...number[]) => number",
    validationCode:
      'typeof value === "function" && typeof value(1, 2, 3) === "number" && typeof value() === "number"',
    explanation:
      "A function that takes any number of number arguments and returns a number.",
    hints: [
      "Use the rest parameter syntax (...args)",
      "Function should accept variable number of arguments",
      "Example: (...nums) => nums.reduce((a, b) => a + b, 0)",
    ],
    // Answer: (...nums) => nums.reduce((a, b) => a + b, 0)
  },
  {
    id: 17,
    typeDescription: "Partial<{ name: string, age: number, active: boolean }>",
    validationCode:
      'typeof value === "object" && value !== null && (!("name" in value) || typeof value.name === "string") && (!("age" in value) || typeof value.age === "number") && (!("active" in value) || typeof value.active === "boolean")',
    explanation:
      "An object where all properties are optional from the original type.",
    hints: [
      "All properties are optional",
      "Can include any subset of name, age, and active",
      'Examples: {}, { name: "John" }, { age: 30, active: true }',
    ],
    // Answer: { name: "John" }
  },
  {
    id: 18,
    typeDescription: "[key: string]: number",
    validationCode:
      'typeof value === "object" && value !== null && !Array.isArray(value) && Object.entries(value).length > 0 && Object.entries(value).every(([_, v]) => typeof v === "number")',
    explanation:
      "An object with string keys and number values (index signature).",
    hints: [
      "Create an object with string keys and number values",
      "All values must be numbers",
      "Example: { a: 1, b: 2, c: 3 }",
    ],
    // Answer: { x: 1, y: 2, z: 3 }
  },
  {
    id: 19,
    typeDescription: "((x: number) => void) | null",
    validationCode:
      'value === null || (typeof value === "function" && typeof value(5) === "undefined")',
    explanation:
      "A union type that can be either a function taking a number or null.",
    hints: [
      "Either provide null or a function that doesn't return anything",
      "Example: (x) => { console.log(x) }",
    ],
    // Answer: (x) => { /* do nothing */ }
  },
  {
    id: 20,
    typeDescription: "keyof { name: string; age: number; isAdmin: boolean }",
    validationCode:
      'value === "name" || value === "age" || value === "isAdmin"',
    explanation:
      "A type representing valid property names of the given object type.",
    hints: [
      "Must be one of the exact property names",
      'Examples: "name", "age", or "isAdmin"',
    ],
    // Answer: "name"
  },
  {
    id: 21,
    typeDescription: "{ readonly id: number, data: unknown }",
    validationCode:
      'typeof value === "object" && value !== null && typeof value.id === "number" && "data" in value',
    explanation:
      "An object with a readonly numeric id and a data property of unknown type.",
    hints: [
      "Create an object with id and data properties",
      "The id must be a number, data can be anything",
      "Example: { id: 1, data: 'anything' }",
    ],
    // Answer: { id: 123, data: "any value" }
  },
  {
    id: 22,
    typeDescription: "Required<{ name?: string; age?: number }>",
    validationCode:
      'typeof value === "object" && value !== null && typeof value.name === "string" && typeof value.age === "number"',
    explanation:
      "An object where all properties from the original type are required.",
    hints: [
      "Both properties must be present",
      "No optional properties allowed",
      'Example: { name: "John", age: 30 }',
    ],
    // Answer: { name: "John", age: 42 }
  },
  {
    id: 23,
    typeDescription: "Exclude<string | number | boolean, boolean>",
    validationCode:
      '(typeof value === "string" || typeof value === "number") && typeof value !== "boolean"',
    explanation:
      "A type that excludes boolean from the union of string, number, and boolean.",
    hints: [
      "Can be either string or number, but not boolean",
      'Examples: "text" or 42',
    ],
    // Answer: "any string" or 123
  },
  {
    id: 24,
    typeDescription: "{ [K in 'x' | 'y' | 'z']: number }",
    validationCode:
      'typeof value === "object" && value !== null && typeof value.x === "number" && typeof value.y === "number" && typeof value.z === "number" && Object.keys(value).length === 3',
    explanation:
      "An object with specific keys x, y, and z, all with number values.",
    hints: [
      "Must have exactly the properties x, y, and z",
      "All values must be numbers",
      "Example: { x: 1, y: 2, z: 3 }",
    ],
    // Answer: { x: 10, y: 20, z: 30 }
  },
  {
    id: 25,
    typeDescription:
      "((a: number, b: number) => number) & { description: string }",
    validationCode:
      'typeof value === "function" && typeof value.description === "string" && typeof value(1, 2) === "number"',
    explanation: "A function with properties (intersection type).",
    hints: [
      "Create a function that also has a description property",
      "Function must take two numbers and return a number",
      "Example: Object.assign((a, b) => a + b, { description: 'Add numbers' })",
    ],
    // Answer: Object.assign((a, b) => a + b, { description: "Adds two numbers" })
  },
  {
    id: 26,
    typeDescription: "WeakMap<object, string>",
    validationCode: "value instanceof WeakMap",
    explanation: "A WeakMap with object keys and string values.",
    hints: [
      "Use new WeakMap()",
      "Keys must be objects, values must be strings",
      "Example: new WeakMap([[{}, 'value']])",
    ],
    // Answer: new WeakMap([[{}, "test"]])
  },
];

export default challenges;
