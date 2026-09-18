import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { loginValidator, registerValidator } from "../validators/authValidators.js";

async function runValidator(middlewares, body) {
  const req = { body };
  const res = {};
  let capturedError = null;

  for (const middleware of middlewares) {
    if (typeof middleware.run === "function") {
      await middleware.run(req);
      continue;
    }
    await new Promise((resolve) => {
      middleware(req, res, (err) => {
        capturedError = err || null;
        resolve();
      });
    });
  }

  return capturedError;
}

describe("auth validation", () => {
  it("rejects non-Gmail addresses during registration with a useful field error", async () => {
    const err = await runValidator(registerValidator, {
      name: "Test User",
      username: "test_user",
      email: "test@example.com",
      password: "password123",
    });

    assert.equal(err.statusCode, 422);
    assert.deepEqual(err.errors[0], {
      field: "email",
      message: "Only Gmail addresses ending in @gmail.com are allowed.",
    });
  });

  it("rejects non-Gmail addresses during login with a useful field error", async () => {
    const err = await runValidator(loginValidator, {
      email: "test@example.com",
      password: "password123",
    });

    assert.equal(err.statusCode, 422);
    assert.deepEqual(err.errors[0], {
      field: "email",
      message: "Only Gmail addresses ending in @gmail.com are allowed.",
    });
  });
});
