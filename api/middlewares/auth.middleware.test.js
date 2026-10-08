import { test, before } from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import { requireAuth } from "./auth.middleware.js";

before(() => {
  process.env.JWT_SECRET = "test-secret";
});

function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "15m" });
}

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

test("requireAuth: rejects with 401 when there is no access_token cookie", () => {
  const req = { cookies: {} };
  const res = makeRes();
  let nextCalled = false;

  requireAuth()(req, res, () => { nextCalled = true; });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 401);
});

test("requireAuth: rejects with 403 when the token is invalid", () => {
  const req = { cookies: { access_token: "not-a-real-token" } };
  const res = makeRes();
  let nextCalled = false;

  requireAuth()(req, res, () => { nextCalled = true; });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 403);
});

test("requireAuth: with no roles specified, any authenticated user passes", () => {
  const token = signToken({ id: 1, role: "student" });
  const req = { cookies: { access_token: token } };
  const res = makeRes();
  let nextCalled = false;

  requireAuth()(req, res, () => { nextCalled = true; });

  assert.equal(nextCalled, true);
  assert.equal(req.user.role, "student");
});

test("requireAuth: rejects with 403 when the role is not in the allowed list", () => {
  const token = signToken({ id: 1, role: "student" });
  const req = { cookies: { access_token: token } };
  const res = makeRes();
  let nextCalled = false;

  requireAuth("teacher")(req, res, () => { nextCalled = true; });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 403);
});

test("requireAuth: allows access when the role is in the allowed list", () => {
  const token = signToken({ id: 1, role: "teacher" });
  const req = { cookies: { access_token: token } };
  const res = makeRes();
  let nextCalled = false;

  requireAuth("teacher")(req, res, () => { nextCalled = true; });

  assert.equal(nextCalled, true);
});

test("requireAuth: superadmin bypasses the allowed-roles check (matches auth bypass behavior)", () => {
  const token = signToken({ id: 1, role: "superadmin" });
  const req = { cookies: { access_token: token } };
  const res = makeRes();
  let nextCalled = false;

  // Regression guard for AUDIT_SITE.md #4: admin.routes.js only allowed
  // "admin" and superadmin got locked out everywhere until the bypass
  // was added. This must keep working even if the route only lists
  // other roles explicitly.
  requireAuth("teacher")(req, res, () => { nextCalled = true; });

  assert.equal(nextCalled, true);
});

test("requireAuth: a role array passed as a single argument is not silently treated as valid (AUDIT_SITE.md #3 regression)", () => {
  const token = signToken({ id: 1, role: "teacher" });
  const req = { cookies: { access_token: token } };
  const res = makeRes();
  let nextCalled = false;

  // Calling requireAuth(["teacher"]) instead of requireAuth("teacher") was
  // the exact bug that broke every /api/grades/* route: allowedRoles became
  // [["teacher"]] and never matched a real role string.
  requireAuth(["teacher"])(req, res, () => { nextCalled = true; });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 403);
});
