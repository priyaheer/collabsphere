import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import jwt from "jsonwebtoken";

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-jwt-secret";
process.env.MONGO_URI = "mongodb://127.0.0.1:27017/collabsphere-auth-test";

let app;
let mongo;
let User;

const userPayload = {
  name: "Auth Flow",
  email: "authflow@gmail.com",
  password: "Password123!",
  confirm: "Password123!",
};

before(async () => {
  mongo = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongo.getUri();
  ({ default: app } = await import("../server.js"));
  ({ default: User } = await import("../models/User.js"));
  const { connectDB } = await import("../config/db.js");
  await connectDB(process.env.MONGO_URI);
});

after(async () => {
  const { disconnectDB } = await import("../config/db.js");
  await disconnectDB();
  await mongo.stop();
});

describe("normal auth flow", () => {
  it("registers with a bcrypt-hashed password and logs in immediately", async () => {
    const register = await request(app).post("/api/auth/register").send(userPayload);
    assert.equal(register.status, 201);

    const user = await User.findOne({ email: userPayload.email }).select("+password");
    assert.notEqual(user.password, userPayload.password);
    assert.ok(await user.comparePassword(userPayload.password));

    const login = await request(app).post("/api/auth/login").send({
      email: userPayload.email,
      password: userPayload.password,
    });
    assert.equal(login.status, 200);
    assert.ok(login.body.data.token);
  });

  it("allows a JWT on protected APIs and clears authentication on logout", async () => {
    await request(app).post("/api/auth/register").send({ ...userPayload, email: "protected@gmail.com" });
    const login = await request(app).post("/api/auth/login").send({
      email: "protected@gmail.com",
      password: userPayload.password,
    });
    assert.equal(login.status, 200);

    const token = login.body.data.token;
    const me = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${token}`);
    assert.equal(me.status, 200);

    const logout = await request(app).post("/api/auth/logout").set("Authorization", `Bearer ${token}`);
    assert.equal(logout.status, 200);

    const missing = await request(app).get("/api/auth/me");
    assert.equal(missing.status, 401);

    const invalid = await request(app).get("/api/auth/me").set("Authorization", "Bearer invalid.token");
    assert.equal(invalid.status, 401);

    const expired = jwt.sign({ id: "507f1f77bcf86cd799439011" }, process.env.JWT_SECRET, { expiresIn: -1 });
    const expiredResponse = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${expired}`);
    assert.equal(expiredResponse.status, 401);

    const malformedProject = await request(app)
      .get("/api/projects/not-an-id")
      .set("Authorization", `Bearer ${token}`);
    assert.equal(malformedProject.status, 422);

    const missingRegistrationField = await request(app).post("/api/auth/register").send({ email: "missing@gmail.com" });
    assert.equal(missingRegistrationField.status, 422);
  });
});
