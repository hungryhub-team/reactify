import { Hono } from "hono";
import { taskCreateSchema, taskUpdateSchema } from "shared";
import { taskUsecase } from "../../usecase/task_usecase";

const ERROR_STATUS: Record<string, number> = {
  INVALID_ID: 400,
  NOT_FOUND: 404,
  DB_ERROR: 500,
};

const taskHandler = new Hono();

// GET / — list tasks (optional ?q= search, ?page=, ?limit=)
taskHandler.get("/", async (c) => {
  const q = c.req.query("q") ?? "";
  const pageQuery = c.req.query("page");
  const limitQuery = c.req.query("limit");
  
  const page = pageQuery ? Number.parseInt(pageQuery, 10) : 1;
  const limit = limitQuery ? Number.parseInt(limitQuery, 20) : 20;
  
  const result = await taskUsecase.listTasks({ q, page, limit });

  if (!result.ok) {
    const status = ERROR_STATUS[result.error.code] ?? 500;
    return c.json(
      { success: false, error: result.error.error, code: result.error.code },
      status as 400 | 404 | 500,
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

// GET /:id — get single task
taskHandler.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const result = await taskUsecase.getTaskById(id);

  if (!result.ok) {
    const status = ERROR_STATUS[result.error.code] ?? 500;
    return c.json(
      { success: false, error: result.error.error, code: result.error.code },
      status as 400 | 404 | 500,
    );
  }

  return c.json({ success: true, data: result.data });
});

// POST / — create task
taskHandler.post("/", async (c) => {
  const body = await c.req.json();
  const parsed = taskCreateSchema.safeParse(body);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Invalid input";
    return c.json({ success: false, error: firstError, code: "VALIDATION" }, 400);
  }

  const result = await taskUsecase.createTask(parsed.data);

  if (!result.ok) {
    const status = ERROR_STATUS[result.error.code] ?? 500;
    return c.json(
      { success: false, error: result.error.error, code: result.error.code },
      status as 400 | 404 | 500,
    );
  }

  return c.json({ success: true, data: result.data }, 201);
});

// PUT /:id — update task
taskHandler.put("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const body = await c.req.json();
  const parsed = taskUpdateSchema.safeParse(body);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Invalid input";
    return c.json({ success: false, error: firstError, code: "VALIDATION" }, 400);
  }

  const result = await taskUsecase.updateTask(id, parsed.data);

  if (!result.ok) {
    const status = ERROR_STATUS[result.error.code] ?? 500;
    return c.json(
      { success: false, error: result.error.error, code: result.error.code },
      status as 400 | 404 | 500,
    );
  }

  return c.json({ success: true, data: result.data });
});

// DELETE /:id — delete task
taskHandler.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const result = await taskUsecase.deleteTask(id);

  if (!result.ok) {
    const status = ERROR_STATUS[result.error.code] ?? 500;
    return c.json(
      { success: false, error: result.error.error, code: result.error.code },
      status as 400 | 404 | 500,
    );
  }

  return c.json({ success: true, message: result.data.message });
});

export default taskHandler;
