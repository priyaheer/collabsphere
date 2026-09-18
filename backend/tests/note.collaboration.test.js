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

describe("markdown notes", () => {
  it("creates, reads, updates, and deletes notes only for project members", async () => {
    const memberToken = await registerAndLogin("notes-member@gmail.com");
    const outsiderToken = await registerAndLogin("notes-outsider@gmail.com");

    const projectResponse = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${memberToken}`)
      .send({ name: "Notes Project", description: "Markdown notes" });
    assert.equal(projectResponse.status, 201);
    const projectId = projectResponse.body.data.project._id;

    const created = await request(app)
      .post(`/api/projects/${projectId}/notes`)
      .set("Authorization", `Bearer ${memberToken}`)
      .send({ title: "Decision", content: "# Use MongoDB\n\n- Keep notes in Markdown." });
    assert.equal(created.status, 201);
    const noteId = created.body.data.note._id;

    const listed = await request(app)
      .get(`/api/projects/${projectId}/notes`)
      .set("Authorization", `Bearer ${memberToken}`);
    assert.equal(listed.status, 200);
    assert.equal(listed.body.data.notes[0].content, "# Use MongoDB\n\n- Keep notes in Markdown.");

    const updated = await request(app)
      .put(`/api/notes/${noteId}`)
      .set("Authorization", `Bearer ${memberToken}`)
      .send({ content: "# Updated decision" });
    assert.equal(updated.status, 200);
    assert.equal(updated.body.data.note.content, "# Updated decision");

    const outsiderRead = await request(app)
      .get(`/api/notes/${noteId}`)
      .set("Authorization", `Bearer ${outsiderToken}`);
    assert.equal(outsiderRead.status, 403);

    const outsiderAi = await request(app)
      .post("/api/gemini/explain")
      .set("Authorization", `Bearer ${outsiderToken}`)
      .send({ noteId, content: "ignored", type: "note" });
    assert.equal(outsiderAi.status, 403);

    const outsiderReadme = await request(app)
      .post("/api/gemini/readme")
      .set("Authorization", `Bearer ${outsiderToken}`)
      .send({ projectId, projectName: "Private project", description: "ignored" });
    assert.equal(outsiderReadme.status, 403);

    const deleted = await request(app)
      .delete(`/api/notes/${noteId}`)
      .set("Authorization", `Bearer ${memberToken}`);
    assert.equal(deleted.status, 200);

    const missing = await request(app)
      .get(`/api/notes/${noteId}`)
      .set("Authorization", `Bearer ${memberToken}`);
    assert.equal(missing.status, 404);
  });
});
