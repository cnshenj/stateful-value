stateful-value: Values with built-in states
===========================================
Please see [ARTICLE.md](https://github.com/cnshenj/stateful-value/blob/main/ARTICLE.md) for the rationale of the package.

# Installation
npm i -S stateful-value

# Usage
To represent a value that could be:
- Unfulfilled: it has not been loaded/populated (e.g. AJAX, user input)
- Error: error encountered during loading operation
- Valid: it has been successfully loaded

```typescript
import { StatefulValue } from "stateful-value";

let data: StatefulValue<string>;
if (isValid(data)) {
    // data is guaranteed to be a string
    console.log(data.length);
}

data = await loadData();
if (isError(data)) {
    // data is guaranteed to be an Error (or subclass of Error) object
    console.error(data.message);
}
```

# API
### Type `StatefulValue<T>`
Defines a type that can represent a value that is either unfulfilled, or is an error, or is valid.

### Function `isUnfulfilled(): boolean`
Determines whether the value is `undefined` or an `Unfulfilled` object.

### Function `isError(): boolean`
Determines whether the value is an `Error` object.

### Function `isValid(): boolean`
Determines whether the value is valid (i.e. an instance of type `T`).

### Function `isNonNull(): boolean`
Determines whether the value is valid and is not `null`.
Note: `null` is considered a valid value if `T` contains it, e.g. `StatefulValue<string | null>`.

### Function `getValue(): T | undefined`
Returns the value if it is valid; otherwise, returns `undefined`.

### Function `getError(): T | undefined`
Returns the value if it is an `Error` object; otherwise, returns `undefined`.

### Function `resolveValue`
```typescript
async function resolveValue<T>(
    callback: () => Promise<T>,
    dependencies: StatefulValue<unknown>[] = []
): Promise<StatefulValue<T>>
```
Resolves a stateful value when all dependencies are valid.
- If any of the dependencies is an error, then return the first dependency error.
- If all dependencies are valid, then invoke the callback to get the target stateful value.
- Otherwise, returns `Unfulfilled`.
