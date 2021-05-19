import {
    getError,
    getValue,
    isError,
    isNonNull,
    isUnfulfilled,
    isValid,
    resolveValue,
    StatefulValue,
    Unfulfilled
} from "../src";

const testMessage = "Test message";
const testError = new Error("Test error");

test("isUnfulfilled", () => {
    let s: StatefulValue<string> = undefined;
    expect(isUnfulfilled(s)).toBeTruthy();
    expect(isError(s)).toBeFalsy();
    expect(isValid(s)).toBeFalsy();
    s = Unfulfilled.value;
    expect(isUnfulfilled(s)).toBeTruthy();
    expect(isError(s)).toBeFalsy();
    expect(isValid(s)).toBeFalsy();
});

test("isError", () => {
    const s: StatefulValue<string> = testError;
    expect(isUnfulfilled(s)).toBeFalsy();
    expect(isError(s)).toBeTruthy();
    expect(isValid(s)).toBeFalsy();
});

test("isValid", () => {
    const s: StatefulValue<string> = testMessage;
    expect(isUnfulfilled(s)).toBeFalsy();
    expect(isError(s)).toBeFalsy();
    expect(isValid(s)).toBeTruthy();
});

test("isNonNull", () => {
    let s: StatefulValue<string | null> = testMessage;
    expect(isNonNull(s)).toBeTruthy();
    s = null;
    expect(isNonNull(s)).toBeFalsy();
});

test("getValue", () => {
    let s: StatefulValue<string> = testMessage;
    expect(getValue(s)).toEqual(testMessage);
    s = Unfulfilled.value;
    expect(getValue(s)).toBeUndefined();
    s = undefined;
    expect(getValue(s)).toBeUndefined();
    s = testError;
    expect(getValue(s)).toBeUndefined();
});

test("getError", () => {
    let s: StatefulValue<string> = testMessage;
    expect(getError(s)).toBeUndefined();
    s = Unfulfilled.value;
    expect(getError(s)).toBeUndefined();
    s = undefined;
    expect(getError(s)).toBeUndefined();
    s = testError;
    expect(getError(s)).toEqual(testError);
});

const target = 99;
const callback = (): Promise<StatefulValue<number>> => Promise.resolve(target);

test("resolveValue => first error", async () => {
    const dependencies: StatefulValue<string>[] = [testMessage, testError];
    const result = await resolveValue(callback, dependencies);
    return expect(result).toEqual(testError);
});

test("resolveValue => Unfulfilled", async () => {
    const dependencies: StatefulValue<string>[] = [testMessage, Unfulfilled.value];
    const result = await resolveValue(callback, dependencies);
    return expect(result).toEqual(Unfulfilled.value);
});

test("resolveValue => value", async () => {
    const dependencies: StatefulValue<string>[] = [testMessage, testMessage];
    const result = await resolveValue(callback, dependencies);
    return expect(result).toEqual(target);
});