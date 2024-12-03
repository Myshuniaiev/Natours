import { describe, it, expect, vi } from "vitest";
import { Request, Response } from "express";
import catchAsync from "../../src/utils/catchAsync";

describe("catchAsync", () => {
  it("calls the function and does not call next on success", async () => {
    const req = {} as Request;
    const res = {} as Response;
    const next = vi.fn();
    const handler = vi.fn().mockResolvedValue(undefined);

    const wrappedHandler = catchAsync(handler);
    await wrappedHandler(req, res, next);

    expect(handler).toHaveBeenCalledWith(req, res, next);
    expect(next).not.toHaveBeenCalled();
  });

  it("passes errors to next when the function rejects", async () => {
    const req = {} as Request;
    const res = {} as Response;
    const next = vi.fn();
    const error = new Error("Async Error");
    const handler = vi.fn().mockRejectedValue(error);

    const wrappedHandler = catchAsync(handler);
    await wrappedHandler(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
