/**
 * A special class to represent the state which the value is unfulfilled.
 */
export class Unfulfilled {
    public static readonly value = new Unfulfilled();

    /**
     * TypeScript treats empty class differently,
     * add a dummy method to make it not empty
     */
    public dummy(): never {
        throw new Error("Dummy function. Should not be called.");
    }
}
