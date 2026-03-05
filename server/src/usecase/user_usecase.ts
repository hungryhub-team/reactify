import { userRepository, accountRepository } from "../repository/postgres";
import { auth, allowAdminSignUp, clearAdminSignUp } from "../auth";
import { hashPassword } from "better-auth/crypto";
import { DEFAULT_USER_PASSWORD } from "shared";
import type { User, UserCreate, UserUpdate } from "shared";
import type { UserEntity } from "../repository/postgres";

type UsecaseErrorCode = "INVALID_ID" | "NOT_FOUND" | "DB_ERROR" | "DUPLICATE_EMAIL";

type UsecaseError = {
  error: string;
  code: UsecaseErrorCode;
};

type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: UsecaseError };

type PaginatedResult<T> =
  | { ok: true; data: T; total: number }
  | { ok: false; error: UsecaseError };

function serializeUser(u: UserEntity): User {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    emailVerified: u.emailVerified,
    image: u.image,
    role: u.role,
    createdAt: u.createdAt.toISOString(),
    updatedAt: u.updatedAt.toISOString(),
  };
}

async function listUsers(params: { q: string; role?: number; page?: number; limit?: number }): Promise<PaginatedResult<User[]>> {
  const q = params.q.trim();
  const { role } = params;
  const page = params.page && params.page > 0 ? params.page : 1;
  const limit = params.limit && params.limit > 0 ? params.limit : 10;

  const result = await userRepository.findMany({
    q,
    role,
    page,
    limit,
  });

  if (!result.success) {
    console.error("[users][usecase] List error:", result.error);
    return {
      ok: false,
      error: { error: result.error.message, code: "DB_ERROR" },
    };
  }

  return {
    ok: true,
    data: result.data.items.map(serializeUser),
    total: result.data.total,
  };
}

async function getUserById(id: string): Promise<Result<User>> {
  if (!id || id.trim() === "") {
    return { ok: false, error: { error: "Invalid ID", code: "INVALID_ID" } };
  }

  const result = await userRepository.findById(id);

  if (!result.success) {
    console.error("[users][usecase] Get error:", result.error);
    return { ok: false, error: { error: result.error.message, code: "DB_ERROR" } };
  }

  if (!result.data) {
    return { ok: false, error: { error: "User not found", code: "NOT_FOUND" } };
  }

  return { ok: true, data: serializeUser(result.data) };
}

async function createUser(input: UserCreate): Promise<Result<User>> {
  // Check for duplicate email
  const existsResult = await userRepository.emailExists(input.email.toLowerCase());
  if (!existsResult.success) {
    console.error("[users][usecase] Create error:", existsResult.error);
    return { ok: false, error: { error: existsResult.error.message, code: "DB_ERROR" } };
  }

  if (existsResult.data) {
    return {
      ok: false,
      error: { error: "Email already exists", code: "DUPLICATE_EMAIL" },
    };
  }

  // Allow this email through the database hook
  allowAdminSignUp(input.email.toLowerCase());

  try {
    // Use Better Auth's signUp API for proper password hashing (scrypt)
    const response = await auth.api.signUpEmail({
      body: {
        email: input.email.toLowerCase(),
        name: input.name || "",
        password: DEFAULT_USER_PASSWORD,
      },
    });

    if (!response?.user) {
      clearAdminSignUp(input.email.toLowerCase());
      return {
        ok: false,
        error: { error: "Failed to create user via auth", code: "DB_ERROR" },
      };
    }

    // Update role if different from default (USER = 2)
    if (input.role && input.role !== 2) {
      const updateResult = await userRepository.update(response.user.id, { role: input.role });
      if (!updateResult.success) {
        console.error("[users][usecase] Update role error:", updateResult.error);
      }
    }

    const result = await userRepository.findById(response.user.id);

    if (!result.success || !result.data) {
      return {
        ok: false,
        error: { error: "User created but not found", code: "DB_ERROR" },
      };
    }

    return { ok: true, data: serializeUser(result.data) };
  } catch (error) {
    clearAdminSignUp(input.email.toLowerCase());
    console.error("[users][usecase] Create error:", error);
    return { ok: false, error: { error: "Failed to create user", code: "DB_ERROR" } };
  }
}

async function updateUser(id: string, input: UserUpdate): Promise<Result<User>> {
  if (!id || id.trim() === "") {
    return { ok: false, error: { error: "Invalid ID", code: "INVALID_ID" } };
  }

  // Check if user exists
  const existsResult = await userRepository.exists(id);
  if (!existsResult.success) {
    console.error("[users][usecase] Update error:", existsResult.error);
    return { ok: false, error: { error: existsResult.error.message, code: "DB_ERROR" } };
  }

  if (!existsResult.data) {
    return { ok: false, error: { error: "User not found", code: "NOT_FOUND" } };
  }

  // Check for duplicate email if email is being updated
  if (input.email) {
    const emailInUseResult = await userRepository.findByEmail(input.email.toLowerCase());
    if (!emailInUseResult.success) {
      console.error("[users][usecase] Update error:", emailInUseResult.error);
      return { ok: false, error: { error: emailInUseResult.error.message, code: "DB_ERROR" } };
    }

    if (emailInUseResult.data && emailInUseResult.data.id !== id) {
      return {
        ok: false,
        error: { error: "Email already in use", code: "DUPLICATE_EMAIL" },
      };
    }
  }

  const updateData: Record<string, unknown> = {};
  if (input.name !== undefined) updateData.name = input.name;
  if (input.email !== undefined) updateData.email = input.email.toLowerCase();
  if (input.role !== undefined) updateData.role = input.role;

  const result = await userRepository.update(id, updateData);

  if (!result.success) {
    console.error("[users][usecase] Update error:", result.error);
    return { ok: false, error: { error: result.error.message, code: "DB_ERROR" } };
  }

  return { ok: true, data: serializeUser(result.data) };
}

async function deleteUser(id: string): Promise<Result<{ message: string }>> {
  if (!id || id.trim() === "") {
    return { ok: false, error: { error: "Invalid ID", code: "INVALID_ID" } };
  }

  // Check if user exists
  const existsResult = await userRepository.exists(id);
  if (!existsResult.success) {
    console.error("[users][usecase] Delete error:", existsResult.error);
    return { ok: false, error: { error: existsResult.error.message, code: "DB_ERROR" } };
  }

  if (!existsResult.data) {
    return { ok: false, error: { error: "User not found", code: "NOT_FOUND" } };
  }

  const result = await userRepository.delete(id);

  if (!result.success) {
    console.error("[users][usecase] Delete error:", result.error);
    return { ok: false, error: { error: result.error.message, code: "DB_ERROR" } };
  }

  return { ok: true, data: { message: "User deleted" } };
}

async function resetPassword(id: string): Promise<Result<{ message: string }>> {
  if (!id || id.trim() === "") {
    return { ok: false, error: { error: "Invalid ID", code: "INVALID_ID" } };
  }

  // Check if user exists
  const existsResult = await userRepository.exists(id);
  if (!existsResult.success) {
    console.error("[users][usecase] Reset password error:", existsResult.error);
    return { ok: false, error: { error: existsResult.error.message, code: "DB_ERROR" } };
  }

  if (!existsResult.data) {
    return { ok: false, error: { error: "User not found", code: "NOT_FOUND" } };
  }

  try {
    // Hash with Better Auth's scrypt (same algorithm used by signUp/signIn)
    const hashedPassword = await hashPassword(DEFAULT_USER_PASSWORD);

    // Find credential account
    const accountResult = await accountRepository.findByProviderAccount("credential", id);
    if (!accountResult.success) {
      console.error("[users][usecase] Reset password error:", accountResult.error);
      return { ok: false, error: { error: accountResult.error.message, code: "DB_ERROR" } };
    }

    // Update or create credential account
    if (accountResult.data) {
      const updateResult = await accountRepository.update(accountResult.data.id, {
        password: hashedPassword,
      });
      if (!updateResult.success) {
        console.error("[users][usecase] Reset password error:", updateResult.error);
        return { ok: false, error: { error: updateResult.error.message, code: "DB_ERROR" } };
      }
    } else {
      const createResult = await accountRepository.create({
        id: crypto.randomUUID(),
        accountId: id,
        providerId: "credential",
        userId: id,
        password: hashedPassword,
      });
      if (!createResult.success) {
        console.error("[users][usecase] Reset password error:", createResult.error);
        return { ok: false, error: { error: createResult.error.message, code: "DB_ERROR" } };
      }
    }

    return { ok: true, data: { message: "Password reset to default" } };
  } catch (error) {
    console.error("[users][usecase] Reset password error:", error);
    return { ok: false, error: { error: "Failed to reset password", code: "DB_ERROR" } };
  }
}

export const userUsecase = {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  resetPassword,
};
