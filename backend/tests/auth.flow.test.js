import { after, afterEach, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-jwt-secret";
process.env.MONGO_URI = "mongodb://127.0.0.1:27017/collabsphere-auth-test";
process.env.CLIENT_URL = "http://localhost:5173";
process.env.APP_URL = "http://localhost:5173";
process.env.EMAIL_DELIVERY = "test";
process.env.EMAIL_FROM = "CollabSphere Test <test@example.com>";

let app;
let mongo;
let User;
let emailService;
let tokenUtils;

const userPayload = (email = "authflow@gmail.com") => ({
  name: "Auth Flow",
  email,
  password: "Password123!",
  confirm: "Password123!",
});

function latestEmail() {
  const messages = emailService.getSentEmails();
  return messages[messages.length - 1];
}

function tokenFromEmail(kind = "verify-email") {
  const text = latestEmail().text;
  const match = text.match(new RegExp(`${kind}\\?token=([a-f0-9]+)`));
  assert.ok(match, `expected ${kind} token in email`);
  return match[1];
}

async function register(email = "authflow@gmail.com") {
  return request(app).post("/api/auth/register").send(userPayload(email));
}

async function registerAndVerify(email = "verified@gmail.com") {
  const res = await register(email);
  assert.equal(res.status, 201);
  const token = tokenFromEmail("verify-email");
  const verify = await request(app).post("/api/auth/verify-email").send({ token });
  assert.equal(verify.status, 200);
  return { email, password: "Password123!", token };
}

before(async () => {
  mongo = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongo.getUri();
  ({ default: app } = await import("../server.js"));
  ({ default: User } = await import("../models/User.js"));
  emailService = await import("../services/emailService.js");
  tokenUtils = await import("../utils/authTokens.js");
  const { connectDB } = await import("../config/db.js");
  await connectDB(process.env.MONGO_URI);
});

afterEach(async () => {
  await User.deleteMany({});
  emailService.clearSentEmails();
});

after(async () => {
  const { disconnectDB } = await import("../config/db.js");
  await disconnectDB();
  await mongo.stop();
});

describe("auth flow", () => {
  it("registers an unverified Gmail user, hashes the password, and sends verification email", async () => {
    const res = await register();
    assert.equal(res.status, 201);
    assert.equal(res.body.data.verificationRequired, true);
    assert.equal(res.body.data.token, undefined);

    const user = await User.findOne({ email: "authflow@gmail.com" }).select(
      "+password +emailVerificationTokenHash"
    );
    assert.equal(user.emailVerified, false);
    assert.notEqual(user.password, "Password123!");
    assert.ok(await user.comparePassword("Password123!"));
    assert.ok(user.emailVerificationTokenHash);
    assert.match(emailService.getSentEmails()[0].text, /verify-email\?token=/);
    assert.doesNotMatch(emailService.getSentEmails()[0].text, /code|OTP/i);
    assert.equal(emailService.getSentEmails().length, 1);
  });

  it("rejects duplicate and invalid registration emails", async () => {
    assert.equal((await register()).status, 201);

    const duplicate = await register();
    assert.equal(duplicate.status, 409);

    const invalid = await request(app).post("/api/auth/register").send(userPayload("person@example.com"));
    assert.equal(invalid.status, 422);
    assert.equal(invalid.body.errors[0].field, "email");
  });

  it("blocks unverified login, then accepts login after a valid single-use verification token", async () => {
    assert.equal((await register()).status, 201);

    const unverified = await request(app).post("/api/auth/login").send({
      email: "authflow@gmail.com",
      password: "Password123!",
    });
    assert.equal(unverified.status, 403);

    const token = tokenFromEmail("verify-email");
    const verified = await request(app).post("/api/auth/verify-email").send({ token });
    assert.equal(verified.status, 200);
    assert.equal(verified.body.data.user.emailVerified, true);

    const reused = await request(app).post("/api/auth/verify-email").send({ token });
    assert.equal(reused.status, 400);

    const login = await request(app).post("/api/auth/login").send({
      email: "authflow@gmail.com",
      password: "Password123!",
    });
    assert.equal(login.status, 200);
    assert.ok(login.body.data.token);
  });

  it("rejects expired verification tokens", async () => {
    assert.equal((await register()).status, 201);
    const token = tokenFromEmail("verify-email");
    await User.updateOne(
      { email: "authflow@gmail.com" },
      { emailVerificationExpiresAt: new Date(Date.now() - 1000) }
    );

    const res = await request(app).post("/api/auth/verify-email").send({ token });
    assert.equal(res.status, 400);
  });

  it("resends verification email and enforces resend cooldown", async () => {
    assert.equal((await register()).status, 201);
    await User.updateOne(
      { email: "authflow@gmail.com" },
      { emailVerificationSentAt: new Date(Date.now() - 61_000) }
    );

    const resend = await request(app).post("/api/auth/resend-verification").send({ email: "authflow@gmail.com" });
    assert.equal(resend.status, 200);
    assert.equal(emailService.getSentEmails().length, 2);

    const cooldown = await request(app).post("/api/auth/resend-verification").send({ email: "authflow@gmail.com" });
    assert.equal(cooldown.status, 429);
  });

  it("rejects wrong passwords and protects private routes from missing or invalid JWTs", async () => {
    const { email } = await registerAndVerify();

    const wrong = await request(app).post("/api/auth/login").send({ email, password: "WrongPassword123!" });
    assert.equal(wrong.status, 401);

    const missing = await request(app).get("/api/auth/me");
    assert.equal(missing.status, 401);

    const invalid = await request(app).get("/api/auth/me").set("Authorization", "Bearer invalid.token.value");
    assert.equal(invalid.status, 401);
  });

  it("allows a valid JWT on protected routes and denies access after logout", async () => {
    const { email, password } = await registerAndVerify("routeuser@gmail.com");
    const login = await request(app).post("/api/auth/login").send({ email, password });
    assert.equal(login.status, 200);

    const token = login.body.data.token;
    const me = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${token}`);
    assert.equal(me.status, 200);

    const logout = await request(app).post("/api/auth/logout").set("Authorization", `Bearer ${token}`);
    assert.equal(logout.status, 200);

    const denied = await request(app).get("/api/auth/me");
    assert.equal(denied.status, 401);
  });

  it("sends reset email, accepts a valid single-use reset token, and invalidates the old password", async () => {
    const { email } = await registerAndVerify("resetuser@gmail.com");

    const forgot = await request(app).post("/api/auth/forgot-password").send({ email });
    assert.equal(forgot.status, 200);
    const resetToken = tokenFromEmail("reset-password");

    const reset = await request(app).post("/api/auth/reset-password").send({
      token: resetToken,
      password: "NewPassword123!",
      confirm: "NewPassword123!",
    });
    assert.equal(reset.status, 200);

    const used = await request(app).post("/api/auth/reset-password").send({
      token: resetToken,
      password: "AnotherPassword123!",
      confirm: "AnotherPassword123!",
    });
    assert.equal(used.status, 400);

    const oldPassword = await request(app).post("/api/auth/login").send({ email, password: "Password123!" });
    assert.equal(oldPassword.status, 401);

    const newPassword = await request(app).post("/api/auth/login").send({ email, password: "NewPassword123!" });
    assert.equal(newPassword.status, 200);
  });

  it("rejects expired reset tokens", async () => {
    const { email } = await registerAndVerify("expiredreset@gmail.com");
    assert.equal((await request(app).post("/api/auth/forgot-password").send({ email })).status, 200);
    const resetToken = tokenFromEmail("reset-password");
    await User.updateOne({ email }, { passwordResetExpiresAt: new Date(Date.now() - 1000) });

    const res = await request(app).post("/api/auth/reset-password").send({
      token: resetToken,
      password: "NewPassword123!",
      confirm: "NewPassword123!",
    });
    assert.equal(res.status, 400);
  });

  it("enforces login brute-force lockout", async () => {
    const { email } = await registerAndVerify("lockout@gmail.com");

    for (let i = 0; i < 5; i += 1) {
      const res = await request(app)
        .post("/api/auth/login")
        .set("X-Forwarded-For", "198.51.100.45")
        .send({ email, password: "BadPassword123!" });
      assert.equal(res.status, 401);
    }

    const locked = await request(app)
      .post("/api/auth/login")
      .set("X-Forwarded-For", "198.51.100.45")
      .send({ email, password: "Password123!" });
    assert.equal(locked.status, 429);
  });

  it("enforces route-level rate limiting for repeated login attempts", async () => {
    for (let i = 0; i < 11; i += 1) {
      const res = await request(app)
        .post("/api/auth/login")
        .set("X-Forwarded-For", "198.51.100.44")
        .send({ email: "missing@gmail.com", password: "BadPassword123!" });
      if (i < 10) assert.equal(res.status, 401);
      else assert.equal(res.status, 429);
    }
  });
});
