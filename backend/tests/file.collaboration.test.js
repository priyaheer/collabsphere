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
  await request(app).post("/api/auth/register").send({
    name: email.split("@")[0],
    email,
    password,
    confirm: password,
  });
  const response = await request(app).post("/api/auth/login").send({ email, password });
  assert.equal(response.status, 200);
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

describe("project files", () => {
  it("uploads, previews, downloads, and deletes files for project members only", async () => {
    const memberToken = await registerAndLogin("files-member@gmail.com");
    const outsiderToken = await registerAndLogin("files-outsider@gmail.com");

    const projectResponse = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${memberToken}`)
      .send({ name: "Files Project", description: "Uploads" });
    assert.equal(projectResponse.status, 201);
    const projectId = projectResponse.body.data.project._id;

    const uploaded = await request(app)
      .post(`/api/projects/${projectId}/files`)
      .set("Authorization", `Bearer ${memberToken}`)
      .attach("file", Buffer.from("const answer = 42;\n"), "answer.js");
    assert.equal(uploaded.status, 201);
    const fileId = uploaded.body.data.file._id;
    assert.equal(uploaded.body.data.file.originalName, "answer.js");

    const preview = await request(app)
      .get(`/api/files/${fileId}`)
      .set("Authorization", `Bearer ${memberToken}`);
    assert.equal(preview.status, 200);
    assert.equal(preview.body.data.preview.kind, "text");
    assert.match(preview.body.data.preview.content, /answer = 42/);

    const download = await request(app)
      .get(`/api/files/${fileId}/raw`)
      .set("Authorization", `Bearer ${memberToken}`);
    assert.equal(download.status, 200);
    assert.match(download.text, /answer = 42/);

    const outsiderRead = await request(app)
      .get(`/api/files/${fileId}`)
      .set("Authorization", `Bearer ${outsiderToken}`);
    assert.equal(outsiderRead.status, 403);

    const deleted = await request(app)
      .delete(`/api/files/${fileId}`)
      .set("Authorization", `Bearer ${memberToken}`);
    assert.equal(deleted.status, 200);

    const missing = await request(app)
      .get(`/api/files/${fileId}`)
      .set("Authorization", `Bearer ${memberToken}`);
    assert.equal(missing.status, 404);
  });
});
