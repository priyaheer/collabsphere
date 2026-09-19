import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-jwt-secret";

let app;
let mongo;
let Notification;
let File;
let Note;
let Activity;
let GitHubRepository;

async function registerAndLogin(email) {
  const password = "Password123!";
  await request(app).post("/api/auth/register").send({
    name: email.split("@")[0],
    email,
    password,
    confirm: password,
  });
  const login = await request(app).post("/api/auth/login").send({ email, password });
  assert.equal(login.status, 200);
  return login.body.data.token;
}

before(async () => {
  mongo = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongo.getUri();
  ({ default: app } = await import("../server.js"));
  ({ default: Notification } = await import("../models/Notification.js"));
  ({ default: File } = await import("../models/File.js"));
  ({ default: Note } = await import("../models/Note.js"));
  ({ default: Activity } = await import("../models/Activity.js"));
  ({ default: GitHubRepository } = await import("../models/GitHubRepository.js"));
  const { connectDB } = await import("../config/db.js");
  await connectDB(process.env.MONGO_URI);
});

after(async () => {
  const { disconnectDB } = await import("../config/db.js");
  await disconnectDB();
  await mongo.stop();
});

describe("project collaboration", () => {
  it("creates a project, adds a registered member, and limits visibility to collaborators", async () => {
    const ownerToken = await registerAndLogin("owner@gmail.com");
    const memberToken = await registerAndLogin("member@gmail.com");
    const outsiderToken = await registerAndLogin("outsider@gmail.com");

    const created = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ name: "Shared API", description: "A collaborative project", technologies: ["Node.js"] });
    assert.equal(created.status, 201);
    const project = created.body.data.project;
    assert.equal(project.members.length, 1);
    assert.equal(project.members[0].role, "owner");

    const memberUser = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${memberToken}`);
    const memberId = memberUser.body.data.user._id;
    const added = await request(app)
      .post(`/api/projects/${project._id}/members`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ userId: memberId });
    assert.equal(added.status, 201);

    const searchedByEmail = await request(app)
      .get(`/api/projects/${project._id}/members/search?q=outsider%40gmail.com`)
      .set("Authorization", `Bearer ${ownerToken}`);
    assert.equal(searchedByEmail.status, 200);
    assert.equal(searchedByEmail.body.data.users[0].email, "outsider@gmail.com");

    const notifications = await Notification.find({ recipient: memberId }).populate("sender", "name").populate("project", "name");
    assert.equal(notifications.length, 1);
    assert.equal(notifications[0].read, false);
    assert.match(notifications[0].message, /owner added you to the project "Shared API" as member/);

    const notificationList = await request(app)
      .get("/api/notifications")
      .set("Authorization", `Bearer ${memberToken}`);
    assert.equal(notificationList.status, 200);
    assert.equal(notificationList.body.data.unreadCount, 1);
    assert.equal(notificationList.body.data.notifications[0].project._id, project._id);

    const marked = await request(app)
      .patch(`/api/notifications/${notifications[0]._id}/read`)
      .set("Authorization", `Bearer ${memberToken}`);
    assert.equal(marked.status, 200);
    assert.equal(marked.body.data.notification.read, true);

    const memberProjects = await request(app)
      .get("/api/projects")
      .set("Authorization", `Bearer ${memberToken}`);
    assert.equal(memberProjects.status, 200);
    assert.equal(memberProjects.body.data.projects.some((item) => item._id === project._id), true);

    const ownerProjects = await request(app)
      .get("/api/projects?scope=mine")
      .set("Authorization", `Bearer ${ownerToken}`);
    assert.equal(ownerProjects.status, 200);
    const listedProject = ownerProjects.body.data.projects.find((item) => item._id === project._id);
    assert.equal(listedProject.members.length, 2);
    assert.equal(typeof listedProject.members[0].user, "object");
    assert.ok(listedProject.members.every((membership) => membership.user._id));

    const unauthenticatedProjects = await request(app).get("/api/projects");
    assert.equal(unauthenticatedProjects.status, 401);

    const outsiderProject = await request(app)
      .get(`/api/projects/${project._id}`)
      .set("Authorization", `Bearer ${outsiderToken}`);
    assert.equal(outsiderProject.status, 403);
  });

  it("removes project-owned notes, files, activity, and GitHub metadata when deleted", async () => {
    const ownerToken = await registerAndLogin("cleanup-owner@gmail.com");
    const created = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ name: "Cleanup Project" });
    const projectId = created.body.data.project._id;

    const note = await request(app)
      .post(`/api/projects/${projectId}/notes`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ title: "Temporary note", content: "Temporary content" });
    assert.equal(note.status, 201);

    const file = await request(app)
      .post(`/api/projects/${projectId}/files`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .attach("file", Buffer.from("temporary file"), "temporary.txt");
    assert.equal(file.status, 201);
    const fileId = file.body.data.file._id;

    await GitHubRepository.create({
      project: projectId,
      owner: "octocat",
      name: "Hello-World",
      fullName: "octocat/Hello-World",
      htmlUrl: "https://github.com/octocat/Hello-World",
      defaultBranch: "master",
    });

    const deleted = await request(app)
      .delete(`/api/projects/${projectId}`)
      .set("Authorization", `Bearer ${ownerToken}`);
    assert.equal(deleted.status, 200);
    assert.equal(await Note.exists({ project: projectId }), null);
    assert.equal(await File.exists({ project: projectId }), null);
    assert.equal(await Activity.exists({ project: projectId }), null);
    assert.equal(await GitHubRepository.exists({ project: projectId }), null);

    const missingFile = await request(app)
      .get(`/api/files/${fileId}`)
      .set("Authorization", `Bearer ${ownerToken}`);
    assert.equal(missingFile.status, 404);
  });
});