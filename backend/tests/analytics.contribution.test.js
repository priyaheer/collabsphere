import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-jwt-secret";

let app;
let mongo;

async function registerAndLogin(email) {
  const password = "Password123!";
  await request(app).post("/api/auth/register").send({ name: email.split("@")[0], email, password, confirm: password });
  const login = await request(app).post("/api/auth/login").send({ email, password });
  assert.equal(login.status, 200);
  const me = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${login.body.data.token}`);
  return { token: login.body.data.token, user: me.body.data.user };
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

describe("contribution analytics", () => {
  it("reports real note and file totals per authorized project member", async () => {
    const owner = await registerAndLogin("analytics-owner@gmail.com");
    const member = await registerAndLogin("analytics-member@gmail.com");
    const outsider = await registerAndLogin("analytics-outsider@gmail.com");

    const created = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${owner.token}`)
      .send({ name: "Analytics Project", description: "Contribution data" });
    const projectId = created.body.data.project._id;

    await request(app)
      .post(`/api/projects/${projectId}/members`)
      .set("Authorization", `Bearer ${owner.token}`)
      .send({ userId: member.user._id });

    await request(app)
      .post(`/api/projects/${projectId}/notes`)
      .set("Authorization", `Bearer ${owner.token}`)
      .send({ title: "Owner note", content: "Owner content" });
    await request(app)
      .post(`/api/projects/${projectId}/notes`)
      .set("Authorization", `Bearer ${member.token}`)
      .send({ title: "Member note", content: "Member content" });
    await request(app)
      .post(`/api/projects/${projectId}/files`)
      .set("Authorization", `Bearer ${owner.token}`)
      .attach("file", Buffer.from("owner file"), "owner.txt");
    await request(app)
      .post(`/api/projects/${projectId}/files`)
      .set("Authorization", `Bearer ${member.token}`)
      .attach("file", Buffer.from("member file"), "member.txt");

    const analytics = await request(app)
      .get(`/api/projects/${projectId}/analytics`)
      .set("Authorization", `Bearer ${owner.token}`);
    assert.equal(analytics.status, 200);
    assert.equal(analytics.body.data.totalNotes, 2);
    assert.equal(analytics.body.data.totalFiles, 2);

    const byEmail = new Map(analytics.body.data.memberContributions.map((row) => [row.user.email, row]));
    assert.deepEqual({ notes: byEmail.get(owner.user.email).notes, files: byEmail.get(owner.user.email).files }, { notes: 1, files: 1 });
    assert.deepEqual({ notes: byEmail.get(member.user.email).notes, files: byEmail.get(member.user.email).files }, { notes: 1, files: 1 });

    const denied = await request(app)
      .get(`/api/projects/${projectId}/analytics`)
      .set("Authorization", `Bearer ${outsider.token}`);
    assert.equal(denied.status, 403);
  });
});
