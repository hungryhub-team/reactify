import { Hono } from "hono";
import { userCreateSchema, userUpdateSchema } from "shared";
import { userUsecase } from "../../usecase/user_usecase";

const ERROR_STATUS: Record<string, number> = {
  INVALID_ID: 400,
  NOT_FOUND: 404,
  DUPLICATE_EMAIL: 409,
  DB_ERROR: 500,
};

const userHandler = new Hono();

// GET / — list users (optional ?q= search, ?role= filter, ?page=, ?limit=)
userHandler.get("/", async (c) => {
  const q = c.req.query("q") ?? "";
  const roleQuery = c.req.query("role");
  const pageQuery = c.req.query("page");
  const limitQuery = c.req.query("limit");
  
  const role = roleQuery ? Number.parseInt(roleQuery, 10) : undefined;
  const page = pageQuery ? Number.parseInt(pageQuery, 10) : 1;
  const limit = limitQuery ? Number.parseInt(limitQuery, 20) : 20;
  
  const result = await userUsecase.listUsers({ q, role, page, limit });

  if (!result.ok) {
    const status = ERROR_STATUS[result.error.code] ?? 500;
    return c.json(
      { success: false, error: result.error.error, code: result.error.code },
      status as 400 | 404 | 409 | 500,
    );
  }

  const totalPages = Math.ceil(result.total / limit);
  return c.json({
    success: true,
    data: result.data,
    pagination: {
      total: result.total,
      page,
      limit,
      totalPages,
    },
  });
});

// GET /:id — get single user
userHandler.get("/:id", async (c) => {
  const id = c.req.param("id");
  const result = await userUsecase.getUserById(id);

  if (!result.ok) {
    const status = ERROR_STATUS[result.error.code] ?? 500;
    return c.json(
      { success: false, error: result.error.error, code: result.error.code },
      status as 400 | 404 | 409 | 500,
    );
  }

  return c.json({ success: true, data: result.data });
});

// POST / — create user
userHandler.post("/", async (c) => {
  const body = await c.req.json();
  const parsed = userCreateSchema.safeParse(body);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Invalid input";
    return c.json({ success: false, error: firstError, code: "VALIDATION" }, 400);
  }

  const result = await userUsecase.createUser(parsed.data);

  if (!result.ok) {
    const status = ERROR_STATUS[result.error.code] ?? 500;
    return c.json(
      { success: false, error: result.error.error, code: result.error.code },
      status as 400 | 404 | 409 | 500,
    );
  }

  return c.json({ success: true, data: result.data }, 201);
});

// PUT /:id — update user
userHandler.put("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const parsed = userUpdateSchema.safeParse(body);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Invalid input";
    return c.json({ success: false, error: firstError, code: "VALIDATION" }, 400);
  }

  const result = await userUsecase.updateUser(id, parsed.data);

  if (!result.ok) {
    const status = ERROR_STATUS[result.error.code] ?? 500;
    return c.json(
      { success: false, error: result.error.error, code: result.error.code },
      status as 400 | 404 | 409 | 500,
    );
  }

  return c.json({ success: true, data: result.data });
});

// POST /:id/reset-password — reset user password to default
userHandler.post("/:id/reset-password", async (c) => {
  const id = c.req.param("id");
  const result = await userUsecase.resetPassword(id);

  if (!result.ok) {
    const status = ERROR_STATUS[result.error.code] ?? 500;
    return c.json(
      { success: false, error: result.error.error, code: result.error.code },
      status as 400 | 404 | 409 | 500,
    );
  }

  return c.json({ success: true, message: result.data.message });
});

// DELETE /:id — delete user
userHandler.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const result = await userUsecase.deleteUser(id);

  if (!result.ok) {
    const status = ERROR_STATUS[result.error.code] ?? 500;
    return c.json(
      { success: false, error: result.error.error, code: result.error.code },
      status as 400 | 404 | 409 | 500,
    );
  }

  return c.json({ success: true, message: result.data.message });
});

export default userHandler;
