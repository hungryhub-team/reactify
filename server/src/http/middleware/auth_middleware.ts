import { createMiddleware } from "hono/factory";
import type { auth } from "../../auth";

type Env = {
	Variables: {
		user: typeof auth.$Infer.Session.user | null;
		session: typeof auth.$Infer.Session.session | null;
	};
};

/**
 * Auth middleware — blocks unauthenticated requests with 401.
 * Must be used AFTER the session middleware that populates user/session.
 */
export const requireAuth = createMiddleware<Env>(async (c, next) => {
	const user = c.get("user");
	const session = c.get("session");

	if (!user || !session) {
		return c.json(
			{ success: false, error: "Unauthorized", code: "UNAUTHORIZED" },
			401,
		);
	}

	await next();
});
