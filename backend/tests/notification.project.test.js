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

describe("project notifications", () => {
  it("notifies project members about important actions and supports read/delete controls", async () => {
    const owner = await registerAndLogin("notification-owner@gmail.com");
    const member = await registerAndLogin("notification-member@gmail.com");

    const projectResponse = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${owner.token}`)
      .send({ name: "Notification Project", description: "Activity notifications" });
    const projectId = projectResponse.body.data.project._id;

    await request(app)
      .post(`/api/projects/${projectId}/members`)
      .set("Authorization", `Bearer ${owner.token}`)
      .send({ userId: member.user._id });
    await request(app)
      .post(`/api/projects/${projectId}/notes`)
      .set("Authorization", `Bearer ${owner.token}`)
      .send({ title: "A note", content: "Content" });
    await request(app)
      .post(`/api/projects/${projectId}/files`)
      .set("Authorization", `Bearer ${owner.token}`)
      .attach("file", Buffer.from("file"), "activity.txt");
    await request(app)
      .put(`/api/projects/${projectId}`)
      .set("Authorization", `Bearer ${owner.token}`)
      .send({ description: "Updated" });

    const list = await request(app).get("/api/notifications").set("Authorization", `Bearer ${member.token}`);
    assert.equal(list.status, 200);
    assert.equal(list.body.data.unreadCount, 4);
    assert.deepEqual(
      list.body.data.notifications.map((notification) => notification.type).sort(),
      ["FILE_UPLOADED", "MEMBER_ADDED", "NOTE_CREATED", "PROJECT_UPDATED"].sort()
    );

    const firstId = list.body.data.notifications[0]._id;
    const read = await request(app).patch(`/api/notifications/${firstId}/read`).set("Authorization", `Bearer ${member.token}`);
    assert.equal(read.status, 200);
    assert.equal(read.body.data.notification.read, true);

    const allRead = await request(app).patch("/api/notifications/read-all").set("Authorization", `Bearer ${member.token}`);
    assert.equal(allRead.status, 200);
    const afterRead = await request(app).get("/api/notifications").set("Authorization", `Bearer ${member.token}`);
    assert.equal(afterRead.body.data.unreadCount, 0);

    const deleted = await request(app).delete(`/api/notifications/${firstId}`).set("Authorization", `Bearer ${member.token}`);
    assert.equal(deleted.status, 200);

    await request(app)
      .delete(`/api/projects/${projectId}/members/${member.user._id}`)
      .set("Authorization", `Bearer ${owner.token}`);
    const removedNotification = await request(app).get("/api/notifications").set("Authorization", `Bearer ${member.token}`);
    assert.equal(removedNotification.body.data.notifications.some((notification) => notification.type === "MEMBER_REMOVED"), true);
  });
});
