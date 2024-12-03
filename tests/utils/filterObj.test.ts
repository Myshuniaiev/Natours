import { describe, it, expect } from "vitest";
import { filterObj } from "../../src/utils/filterObj";

describe("filterObj", () => {
  it("returns an object with only allowed fields", () => {
    const obj = { name: "Alice", age: 30, role: "admin" };
    const result = filterObj(obj, "name", "role");

    expect(result).toEqual({ name: "Alice", role: "admin" });
  });

  it("excludes fields not in allowed list", () => {
    const obj = { name: "Bob", age: 25 };
    const result = filterObj(obj, "name");

    expect(result).toEqual({ name: "Bob" });
  });

  it("returns an empty object if no fields match", () => {
    const obj = { name: "Charlie" };
    const result = filterObj(obj, "email");

    expect(result).toEqual({});
  });
  it("does not mutate the original object", () => {
    const obj = { name: "Dana", age: 28 };
    const objCopy = { ...obj };
    filterObj(obj, "name");

    expect(obj).toEqual(objCopy);
  });
});
