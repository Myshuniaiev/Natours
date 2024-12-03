import { describe, it, expect } from "vitest";
import AppError from "../../src/utils/appError";

describe("AppError", () => {
  it("creates an error with the correct properties", () => {
    const message = "Not Found";
    const statusCode = 404;
    const error = new AppError(message, statusCode);

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe(message);
    expect(error.statusCode).toBe(statusCode);
    expect(error.status).toBe("fail");
    expect(error.isOperational).toBe(true);
  });

  it('sets status to "error" for 5xx codes', () => {
    const error = new AppError("Server Error", 500);

    expect(error.status).toBe("error");
  });
});
