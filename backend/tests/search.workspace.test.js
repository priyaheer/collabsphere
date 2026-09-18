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
  const response = await request(app).post("/api/auth/login").send({ email, password });
  return { token: response.body.data.token };
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

describe("global search", () => {
  it("returns authorized project, note, and file results but excludes unrelated private data", async () => {
    const owner = await registerAndLogin("search-owner@gmail.com");
    const outsider = await registerAndLogin("search-outsider@gmail.com");

    const privateProject = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${owner.token}`)
      .send({ name: "Secret Atlas", description: "private search marker" });
    const privateId = privateProject.body.data.project._id;
    await request(app)
      .post(`/api/projects/${privateId}/notes`)
      .set("Authorization", `Bearer ${owner.token}`)
      .send({ title: "Secret runbook", content: "private search marker" });
    await request(app)
      .post(`/api/projects/${privateId}/files`)
      .set("Authorization", `Bearer ${owner.token}`)
      .attach("file", Buffer.from("private search marker"), "secret-marker.txt");

    const publicProject = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${owner.token}`)
      .send({ name: "Public Atlas", description: "public search marker", visibility: "public" });
    const publicId = publicProject.body.data.project._id;

    const ownerResults = await request(app)
      .get("/api/search?q=marker")
      .set("Authorization", `Bearer ${owner.token}`);
    assert.equal(ownerResults.status, 200);
    assert.equal(ownerResults.body.data.projects.length, 2);
    assert.equal(ownerResults.body.data.notes.length, 1);
    assert.equal(ownerResults.body.data.files.length, 1);
    assert.equal(ownerResults.body.data.notes[0].project.name, "Secret Atlas");

    const outsiderResults = await request(app)
      .get("/api/search?q=marker")
      .set("Authorization", `Bearer ${outsider.token}`);
    assert.equal(outsiderResults.status, 200);
    assert.equal(outsiderResults.body.data.projects.some((project) => project._id === publicId), true);
    assert.equal(outsiderResults.body.data.projects.some((project) => project._id === privateId), false);
    assert.equal(outsiderResults.body.data.notes.length, 0);
    assert.equal(outsiderResults.body.data.files.length, 0);
  });
});
