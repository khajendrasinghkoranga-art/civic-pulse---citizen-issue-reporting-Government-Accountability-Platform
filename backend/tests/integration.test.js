const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { hasTestDatabase } = require("./helpers/test-environment");
const { startServer, stopServer, request } = require("./helpers/http");

if (!hasTestDatabase) {
  test("database integration suite", { skip: "TEST_DATABASE_URL is not configured; mutation tests are disabled to protect DATABASE_URL" }, () => {});
} else {
  const app = require("../src/app");
  const prisma = require("../src/config/database");
  const suffix = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
  const created = { users: [], departments: [], categories: [], issues: [], assignments: [] };
  let server;
  let port;
  let adminToken;
  let citizenToken;
  let staffId;
  let departmentId;
  let categoryId;
  let issueId;

  before(async () => {
    await prisma.$connect();
    const passwordHash = await bcrypt.hash("TestPass123", 10);
    const [admin, staff, category] = await Promise.all([
      prisma.user.create({ data: { name: `Test Admin ${suffix}`, email: `admin-${suffix}@test.invalid`, passwordHash, role: "SUPER_ADMIN" } }),
      prisma.user.create({ data: { name: `Test Staff ${suffix}`, email: `staff-${suffix}@test.invalid`, passwordHash, role: "DEPARTMENT_STAFF" } }),
      prisma.issueCategory.create({ data: { name: `TEST_CATEGORY_${suffix}`, defaultSlaHours: 24 } }),
    ]);
    created.users.push(admin.id, staff.id);
    created.categories.push(category.id);
    staffId = staff.id;
    categoryId = category.id;
    adminToken = jwt.sign({ id: admin.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    ({ server, port } = await startServer(app));
  });

  after(async () => {
    if (server) await stopServer(server);
    if (created.assignments.length) await prisma.issueAssignment.deleteMany({ where: { id: { in: created.assignments } } });
    if (created.issues.length) await prisma.issue.deleteMany({ where: { id: { in: created.issues } } });
    if (created.departments.length) await prisma.department.deleteMany({ where: { id: { in: created.departments } } });
    if (created.categories.length) await prisma.issueCategory.deleteMany({ where: { id: { in: created.categories } } });
    if (created.users.length) await prisma.user.deleteMany({ where: { id: { in: created.users } } });
    await prisma.$disconnect();
  });

  test("database-backed auth, issues, departments, assignments, validation, and authorization", async (t) => {
    await t.test("registers, rejects duplicate registration, and logs in a citizen", async () => {
      const email = `citizen-${suffix}@test.invalid`;
      const registration = await request(port, "/api/v1/auth/register", { method: "POST", body: { name: "Test Citizen", email, password: "TestPass123", phone: "9876543210" } });
      assert.equal(registration.status, 201);
      assert.equal(registration.body.success, true);
      assert.equal("passwordHash" in registration.body.data.user, false);
      citizenToken = registration.body.data.token;
      created.users.push(registration.body.data.user.id);

      const duplicate = await request(port, "/api/v1/auth/register", { method: "POST", body: { name: "Test Citizen", email, password: "TestPass123" } });
      assert.equal(duplicate.status, 409);

      const login = await request(port, "/api/v1/auth/login", { method: "POST", body: { email, password: "TestPass123" } });
      assert.equal(login.status, 200);
      assert.ok(login.body.data.token);

      const invalidLogin = await request(port, "/api/v1/auth/login", { method: "POST", body: { email, password: "wrong-password" } });
      assert.equal(invalidLogin.status, 401);

      const missingCredentials = await request(port, "/api/v1/auth/login", { method: "POST", body: {} });
      assert.equal(missingCredentials.status, 400);
    });

    await t.test("validates, creates, and lists citizen issues", async () => {
      const invalid = await request(port, "/api/v1/issues", { method: "POST", headers: { Authorization: `Bearer ${citizenToken}` }, body: { title: "bad" } });
      assert.equal(invalid.status, 400);

      const createdIssue = await request(port, "/api/v1/issues", { method: "POST", headers: { Authorization: `Bearer ${citizenToken}` }, body: { title: "Test road repair issue", description: "This issue is created only in the dedicated test database.", categoryId, city: "Test City", pincode: "123456" } });
      assert.equal(createdIssue.status, 201);
      issueId = createdIssue.body.data.id;
      created.issues.push(issueId);

      const list = await request(port, "/api/v1/issues", { headers: { Authorization: `Bearer ${citizenToken}` } });
      assert.equal(list.status, 200);
      assert.ok(Array.isArray(list.body.data));
    });

    await t.test("creates departments and enforces roles", async () => {
      const citizenAttempt = await request(port, "/api/v1/departments", { method: "POST", headers: { Authorization: `Bearer ${citizenToken}` }, body: { name: "Denied Department", code: `DENIED_${suffix}` } });
      assert.equal(citizenAttempt.status, 403);

      const department = await request(port, "/api/v1/departments", { method: "POST", headers: { Authorization: `Bearer ${adminToken}` }, body: { name: `Test Department ${suffix}`, code: `TEST_${suffix}` } });
      assert.equal(department.status, 201);
      departmentId = department.body.data.id;
      created.departments.push(departmentId);

      const duplicate = await request(port, "/api/v1/departments", { method: "POST", headers: { Authorization: `Bearer ${adminToken}` }, body: { name: "Duplicate Department", code: `TEST_${suffix}` } });
      assert.equal(duplicate.status, 409);

      const list = await request(port, "/api/v1/departments");
      assert.equal(list.status, 200);
    });

    await t.test("creates assignments and rejects invalid issue IDs", async () => {
      const invalidIssue = await request(port, "/api/v1/assignments", { method: "POST", headers: { Authorization: `Bearer ${adminToken}` }, body: { issueId: crypto.randomUUID(), departmentId, assignedTo: staffId } });
      assert.equal(invalidIssue.status, 404);

      const assignment = await request(port, "/api/v1/assignments", { method: "POST", headers: { Authorization: `Bearer ${adminToken}` }, body: { issueId, departmentId, assignedTo: staffId, remarks: "Test assignment" } });
      assert.equal(assignment.status, 201);
      created.assignments.push(assignment.body.data.id);
    });
  });
}
