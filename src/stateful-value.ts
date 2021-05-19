import { Unfulfilled } from "./unfulfilled";

/**
 * Value with built-in states.
 * - Unfulfilled (or undefined): the value is unfulfilled, e.g. not loaded yet
 * - Error: the value is an error, e.g. HTTP error
 * - Other: the value is valid
 * Note 1: null is considered a valid value if T extends null, e.g. Stateful<string | null>
 * Note 2: Unfulfilled is a special class that indicates the value is unfulfilled
 */
export type StatefulValue<T> = T | undefined | Unfulfilled | Error;

/**
 * Type guard to determine whether the value is Unfulfilled.
 * @param s The target stateful value.
 * @returns {boolean} true if the value is Unfulfilled.
 */
export function isUnfulfilled<T>(s: StatefulValue<T>): s is undefined | Unfulfilled {
    return typeof s === "undefined" || s instanceof Unfulfilled;
}

/**
 * Type guard to determine whether the value is an error.
 * @param s The target stateful value.
 * @returns {boolean} true if the value is an error.
 */
export function isError<T>(s: StatefulValue<T>): s is Error {
    return s instanceof Error;
}

/**
 * Type guard to determine whether the value is valid.
 * @param s The target stateful value.
 * @returns {boolean} true if the value is valid.
 */
export function isValid<T>(s: StatefulValue<T>): s is T {
    return !isUnfulfilled(s) && !isError(s);
}

/**
 * Type guard to determine whether the value is valid and not null.
 * @param s The target stateful value.
 * @returns {boolean} true if the value is valid and not null.
 */
export function isNonNull<T>(s: StatefulValue<T>): s is Exclude<T, null> {
    return isValid(s) && s !== null;
}

/**
 * Gets the valid value, or undefined if it is not available.
 * @param s The target stateful value.
 * @returns The valid value, or undefined if it is not available.
 */
export function getValue<T>(s: StatefulValue<T>): T | undefined {
    return isUnfulfilled(s) || isError(s) ? undefined : s;
}

/**
 * Gets the error state, or undefined if there is no error.
 * @param s The target stateful value.
 * @returns The error state, or undefined if there is no error.
 */
export function getError<T>(s: StatefulValue<T>): Error | undefined {
    return isError(s) ? s : undefined;
}

/**
 * Resolves a stateful value when all dependencies are valid.
 * - If any of the dependencies is an error, then return the first dependency error.
 * - If all dependencies are valid, then invoke the callback to get the target stateful value.
 * - Otherwise, return Unfulfilled.
 * @param callback The callback to resolve the stateful value.
 * @param dependencies The dependencies.
 */
export async function resolveValue<T>(
    callback: () => Promise<T>,
    dependencies: StatefulValue<unknown>[] = []
): Promise<StatefulValue<T>> {
    const firstDependencyError = dependencies.find(isError);
    if (firstDependencyError) {
        return firstDependencyError;
    }

    return dependencies.every(isValid)
        ? await callback()
        : Unfulfilled.value;
}
