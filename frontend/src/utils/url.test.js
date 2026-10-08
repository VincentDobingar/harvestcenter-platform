import { describe, it, expect } from "vitest";
import { normalizePath, toAbsoluteUrl } from "./url";

describe("normalizePath", () => {
  it("returns '/' for empty input", () => {
    expect(normalizePath("")).toBe("/");
    expect(normalizePath(null)).toBe("/");
  });

  it("ensures exactly one leading slash", () => {
    expect(normalizePath("foo")).toBe("/foo");
    expect(normalizePath("//foo")).toBe("/foo");
  });

  it("strips trailing slashes", () => {
    expect(normalizePath("/foo/")).toBe("/foo");
    expect(normalizePath("/foo//")).toBe("/foo");
  });
});

describe("toAbsoluteUrl", () => {
  it("returns null for empty input", () => {
    expect(toAbsoluteUrl("")).toBeNull();
    expect(toAbsoluteUrl(null)).toBeNull();
  });

  it("returns already-absolute URLs unchanged", () => {
    expect(toAbsoluteUrl("https://example.com/x")).toBe("https://example.com/x");
    expect(toAbsoluteUrl("http://example.com/x")).toBe("http://example.com/x");
  });

  it("falls back to the current origin for a relative path", () => {
    expect(toAbsoluteUrl("/uploads/a.png")).toBe(`${window.location.origin}/uploads/a.png`);
  });

  it("adds a leading slash when missing before using the origin fallback", () => {
    expect(toAbsoluteUrl("uploads/a.png")).toBe(`${window.location.origin}/uploads/a.png`);
  });
});
