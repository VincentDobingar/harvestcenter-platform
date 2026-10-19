import { test } from "node:test";
import assert from "node:assert/strict";
import { buildNewsListQuery, MAX_NEWS_LIMIT } from "./newsQuery.js";

test("defaults to first page of 10 published news", () => {
  const q = buildNewsListQuery({});
  assert.equal(q.limit, 10);
  assert.equal(q.page, 1);
  assert.equal(q.offset, 0);
  assert.equal(q.whereSql, "is_active = 1");
  assert.deepEqual(q.params, []);
});

test("caps the limit and computes the offset", () => {
  const q = buildNewsListQuery({ limit: "500", page: "3" });
  assert.equal(q.limit, MAX_NEWS_LIMIT);
  assert.equal(q.offset, 2 * MAX_NEWS_LIMIT);
});

test("ignores invalid page and limit values", () => {
  const q = buildNewsListQuery({ limit: "-4", page: "abc" });
  assert.equal(q.limit, 1);
  assert.equal(q.page, 1);
});

test("adds the scholarship topic filter", () => {
  const q = buildNewsListQuery({ topic: "Bourses" });
  assert.match(q.whereSql, /REGEXP/);
  assert.equal(q.params.length, 2);
  assert.match(q.params[0], /bourse/);
});

test("unknown topics are ignored", () => {
  assert.equal(buildNewsListQuery({ topic: "x" }).whereSql, "is_active = 1");
});

test("escapes LIKE wildcards in the search", () => {
  const q = buildNewsListQuery({ q: "50%_off" });
  assert.equal(q.params[0], "%50\\%\\_off%");
  assert.equal(q.params.length, 3);
});
