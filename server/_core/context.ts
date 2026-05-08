import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { COOKIE_NAME } from "@shared/const";
import { verifyAdminToken } from "./cookies";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: { role: "admin" | "user" } | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: { role: "admin" | "user" } | null = null;

  try {
    const token = opts.req.cookies?.[COOKIE_NAME];
    if (token && verifyAdminToken(token)) {
      user = { role: "admin" };
    }
  } catch {
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}