The evil "null" and states of values
====================================
The code described in this article is available in npm package [stateful-value](https://www.npmjs.com/package/stateful-value).

# Is `null` "evil"?
The `null` value or `null` pointer has been considered bad (or even "evil") in software engineering.
Here is an example in JavaScript:
```javascript
function getSize(name) { return name.length; }
var myName = null;
console.log(getSize(myName)); // Exception!
```

Okay, `null` is really bad here. What if we pretend `null` (and `undefined`) is not supported by JavaScript?
Would the above code be safer?
```javascript
var myName = 10;
console.log(getSize(myName)); // undefined
```
Without `null`, the outcome is at least as bad, if not worse: the return value of `getSize` is `undefined`.
If it doesn't cause an immediate exception, it will probably cause hard-to-debug error later.

What is "evil" is not `null`, it is the **unexpected** value. The function `getSize` is only expecting strings.
But neither the language nor the function itself is checking the input to make sure it is only getting strings as input.

# Separate the value and the state
If we could enforce the `name` parameter to be of `string` type.
Then we need to provide a way to indicate whether it has a value.
Because even an empty string `""` is a valid string and cannot be used indicate its state. Here is an example:
```javascript
var valueWithState = { value: "", state: "loading" };
```
It is generally considered a good practice to have separate variables for different purposes.
But in this case, whether the value is valid is an **intrinsic** attribute of the value itself.
Extracting the state attribute and manually maintaining it is error prone. For example:
```javascript
valueWithState.state = "loaded"; // Only state is changed, the value is not updated
```
This error is not detected by the compiler/interpreter or linting. It will be a runtime error and may be discovered by users.

# Learning from Rust
Rust handles `null` value and states of a value using Enum:
```rust
pub enum Result<T, E> {
    Ok(T),
    Err(E),
}

let good_result: Result<i32, &'static str> = Ok(10);
let bad_result: Result<i32, &'static str> = Err("Invalid");

// Compilation error: Ok must have an i32 value
let incomplete_result: Result<i32, &'static str> = Ok();
```
The consistency between the value and the state is guaranteed, because:
- The value of the data *must* be set when you create an `Ok`.
- The error *must* be set when you create an `Err`.
- Any violation will be detected during compilation.

Can we have the similar pattern using JavaScript/TypeScript?

# Stateful value using JavaScript/TypeScript
I'm going to use TypeScript to express the concept since it explicitly shows the data types,
which makes the idea easier to understand. But the pattern can be used in JavaScript too.
```typescript
type StatefulValue<T> = T | undefined | Error;
function isValid<T>(value: StatefulValue<T>): value is T {
  return typeof value !== "undefined" && !(value instanceof Error);
}
```
Here, we clearly define 3 possible states of a value - the states are defined by the type of the value itself:
- `undefined` means the value is in unknown state
- `Error` means the value is not valid because of an error
- Otherwise, the value is valid

Note: the return type `value is T` is a "type guard" in TypeScript,
which means when `isValid` returns `true`, `value` is guaranteed to be of type `T`.

With the help from TypeScript's type checking, we can make sure all **expected** outcomes will be handled.
```typescript
let myName: StatefulValue<string>;

// Compilation error: undefined does not have length property
console.log(myName.lengh);

if (isValid(myName)) {
  // Ok. TypeScript knows myName is guaranteed to be string here
  console.log(myName.lengh);
}

myName = "foobar";
// Ok. TypeScript knows myName is "foobar" here
console.log(myName.lengh); 
```
Note: compilation error is desired because issues are found early.

# Implementation notes
## Handling `null`
Note that if `T` contains `null`, then `null` is a valid value and TypeScript will check its usage properly.
```typescript
let data: StatefulValue<string | null> = null;
if (isValid(data)) {
  // data is string or null and TypeScript knows that
  // Compilation error: null does not have length property
  console.log(myName.lengh); 
}
```

## Using a distinct type for `undefined` state
Some libraries reserve `undefined` for special use.
We can define a special type to indicate the state of the value is unknown.
```typescript
export class Unfulfilled {
    public static readonly value = new Unfulfilled();

    // This function exists because TypeScript has special logic for classes without instance members
    public dummy(): never { throw new Error("Dummy"); }
}

// Update type definition to include Unfulfilled type
export type StatefulValue<T> = T | undefined | Unfulfilled | Error;

```

## Supporting more states
It is easy to support more states, just define a special class like `Unfulfilled` to represent each state.
```typescript
export class Unfulfilled {}
export class Loading {}
type StatefulValue<T> = T | undefined | Unfulfilled | Loading | Error;
```
