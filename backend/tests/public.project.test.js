import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-jwt-secret";

let app;
let mongo;

async function login(email) {
  const password = "Password123!";
  await request(app).post("/api/auth/register").send({ name: "Owner", email, password, confirm: password });
  const response = await request(app).post("/api/auth/login").send({ email, password });
  return response.body.data.token;
}

before(async () => {
  mongo = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongo.getUri();
  ({ default: app } = await import("../server.js"));
  const { connectDB } = await import("../config/db.js");
  await connectDB(process.env.MONGO_URI);
});

after(async () => {
  const { disconnectDB } = await import("../config/db.js");
  await disconnectDB();
  await mongo.stop();
});

describe("public project sharing", () => {
  it("enables token sharing, serves read-only data anonymously, and disables the link", async () => {
    const token = await login("public-owner@gmail.com");
    const created = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Public Project", description: "Read-only project" });
    const projectId = created.body.data.project._id;

    const enabled = await request(app)
      .put(`/api/projects/${projectId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ visibility: "public" });
    assert.equal(enabled.status, 200);
    const publicToken = enabled.body.data.project.publicToken;
    assert.match(publicToken, /^[a-f0-9]{48}$/);

    const publicResponse = await request(app).get(`/api/public/projects/${publicToken}`);
    assert.equal(publicResponse.status, 200);
    assert.equal(publicResponse.body.data.project.name, "Public Project");

    const protectedAttempt = await request(app).post(`/api/projects/${projectId}/notes`).send({ title: "Nope", content: "Nope" });
    assert.equal(protectedAttempt.status, 401);

    const disabled = await request(app)
      .put(`/api/projects/${projectId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ visibility: "private" });
    assert.equal(disabled.status, 200);
    assert.equal(disabled.body.data.project.publicToken, undefined);

    const unavailable = await request(app).get(`/api/public/projects/${publicToken}`);
    assert.equal(unavailable.status, 404);
  });
});
