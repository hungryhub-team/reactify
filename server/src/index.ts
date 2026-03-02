import { Hono } from "hono";
import { cors } from "hono/cors";
import type { ApiResponse } from "shared";
import { auth } from "./auth";
import tasks from "./http";
import users from "./http/handler/user_handler";
import { requireAuth } from "./http/middleware/auth_middleware";

const app = new Hono<{
	Variables: {
		user: typeof auth.$Infer.Session.user | null;
		session: typeof auth.$Infer.Session.session | null;
	};
}>();

const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

// CORS — must be before routes
app.use(
	"*",
	cors({
		origin: clientUrl,
		allowHeaders: ["Content-Type", "Authorization"],
		allowMethods: ["POST", "GET", "PUT", "DELETE", "OPTIONS"],
		exposeHeaders: ["Content-Length"],
		maxAge: 600,
		credentials: true,
	}),
);

// Session middleware — attach user/session to context
app.use("*", async (c, next) => {
	const session = await auth.api.getSession({ headers: c.req.raw.headers });
	if (!session) {
		c.set("user", null);
		c.set("session", null);
		await next();
		return;
	}
	c.set("user", session.user);
	c.set("session", session.session);
	await next();
});

// Better Auth handler — mount on /api/auth/*
app.on(["POST", "GET"], "/api/auth/**", async (c) => {
	try {
		const response = await auth.handler(c.req.raw);
		if (response.status >= 400) {
			const body = await response.clone().text();
			console.error(`[auth] Error response ${response.status}:`, body);
		}
		return response;
	} catch (error) {
		console.error("[auth] Handler error:", error);
		return c.json({ error: "Internal auth error" }, 500);
	}
});

// Health check
app.get("/", (c) => {
	return c.text("Hello Hono!");
});

app.get("/hello", async (c) => {
	const data: ApiResponse = {
		message: "Hello BHVR!",
		success: true,
	};
	return c.json(data, { status: 200 });
});

// Protected endpoint example
app.get("/me", (c) => {
	const user = c.get("user");
	const session = c.get("session");
	if (!user) return c.json({ error: "Unauthorized" }, 401);
	return c.json({ user, session });
});

// Auth guard for all /api/* routes (except /api/auth/**)
app.use("/api/*", requireAuth);

// Task CRUD routes
app.route("/api/tasks", tasks);

// User CRUD routes
app.route("/api/users", users);

export default app;
