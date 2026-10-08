import { describe, it, expect } from "vitest";
import { rowsFromResponse } from "./normalize";

describe("rowsFromResponse", () => {
  it("returns [] for null/undefined", () => {
    expect(rowsFromResponse(null)).toEqual([]);
    expect(rowsFromResponse(undefined)).toEqual([]);
  });

  it("returns the array as-is when the response is already an array", () => {
    const data = [{ id: 1 }, { id: 2 }];
    expect(rowsFromResponse(data)).toBe(data);
  });

  it("extracts the first known container key (rows/items/data/...)", () => {
    expect(rowsFromResponse({ rows: [1, 2, 3] })).toEqual([1, 2, 3]);
    expect(rowsFromResponse({ items: [1, 2] })).toEqual([1, 2]);
    expect(rowsFromResponse({ students: [{ id: 1 }] })).toEqual([{ id: 1 }]);
  });

  it("extracts rows from an { ok: true, rows: [...] } wrapper", () => {
    expect(rowsFromResponse({ ok: true, rows: [1, 2] })).toEqual([1, 2]);
  });

  it("falls back to any array-valued property", () => {
    expect(rowsFromResponse({ payload: [1, 2] })).toEqual([1, 2]);
  });

  it("returns [] without throwing when nothing usable is found (regression: used to crash on process.env in the browser)", () => {
    expect(rowsFromResponse({ message: "no data" })).toEqual([]);
    expect(rowsFromResponse({})).toEqual([]);
  });
});
