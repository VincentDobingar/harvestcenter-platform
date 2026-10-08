import { test } from "node:test";
import assert from "node:assert/strict";
import { requireRole } from "./requireRole.js";

function makeRes() {
  return {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

test("requireRole: rejects with 401 when req.user is missing", () => {
  const req = {};
  const res = makeRes();
  let nextCalled = false;

  requireRole("admin")(req, res, () => { nextCalled = true; });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 401);
});

test("requireRole: rejects with 403 when the role is not allowed", () => {
  const req = { user: { role: "student" } };
  const res = makeRes();
  let nextCalled = false;

  requireRole("admin")(req, res, () => { nextCalled = true; });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 403);
});

test("requireRole: allows access when the role matches", () => {
  const req = { user: { role: "admin" } };
  const res = makeRes();
  let nextCalled = false;

  requireRole("admin")(req, res, () => { nextCalled = true; });

  assert.equal(nextCalled, true);
});

test("requireRole: role comparison is case/whitespace insensitive", () => {
  const req = { user: { role: " Admin " } };
  const res = makeRes();
  let nextCalled = false;

  requireRole("admin")(req, res, () => { nextCalled = true; });

  assert.equal(nextCalled, true);
});

test("requireRole: superadmin bypasses the allowed-roles check (AUDIT_SITE.md #4 regression)", () => {
  const req = { user: { role: "superadmin" } };
  const res = makeRes();
  let nextCalled = false;

  // admin.routes.js does router.use(requireRole("admin")); without this
  // bypass, superadmin was locked out of the entire /api/admin/* panel.
  requireRole("admin")(req, res, () => { nextCalled = true; });

  assert.equal(nextCalled, true);
});
