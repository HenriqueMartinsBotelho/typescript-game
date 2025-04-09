// Minimal lib.d.ts with just the essential types needed

interface Array<T> {
  length: number;
  [index: number]: T;
  push(...items: T[]): number;
  pop(): T | undefined;
  // Add other Array methods as needed
}

interface String {
  length: number;
  // Add string methods as needed
}

interface Number {}
interface Boolean {}
interface RegExp {}
interface Date {}

interface Function {
  apply(this: Function, thisArg: any, argArray?: any): any;
  call(this: Function, thisArg: any, ...argArray: any[]): any;
  bind(this: Function, thisArg: any, ...argArray: any[]): any;
}

interface CallableFunction extends Function {}
interface NewableFunction extends Function {}

interface ObjectConstructor {
  assign<T extends {}, U>(target: T, source: U): T & U;
  // Add other Object methods as needed
}

declare var Object: ObjectConstructor;

interface Object {}

type Partial<T> = { [P in keyof T]?: T[P] };
type Required<T> = { [P in keyof T]-?: T[P] };
type Readonly<T> = { readonly [P in keyof T]: T[P] };
type Pick<T, K extends keyof T> = { [P in K]: T[P] };
type Record<K extends keyof any, T> = { [P in K]: T };
type Exclude<T, U> = T extends U ? never : T;
type Extract<T, U> = T extends U ? T : never;
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;

// Error interface
interface Error {
  name: string;
  message: string;
  stack?: string;
}

// Promise interface
interface Promise<T> {
  then<TResult1 = T, TResult2 = never>(
    onfulfilled?: ((value: T) => TResult1 | Promise<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | Promise<TResult2>) | null
  ): Promise<TResult1 | TResult2>;
  catch<TResult = never>(
    onrejected?: ((reason: any) => TResult | Promise<TResult>) | null
  ): Promise<T | TResult>;
}

// Map, Set, and other collections
interface Map<K, V> {
  clear(): void;
  delete(key: K): boolean;
  get(key: K): V | undefined;
  has(key: K): boolean;
  set(key: K, value: V): this;
  readonly size: number;
}

interface Set<T> {
  add(value: T): this;
  clear(): void;
  delete(value: T): boolean;
  has(value: T): boolean;
  readonly size: number;
}
