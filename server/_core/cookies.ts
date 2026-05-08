import type { CookieOptions, Request } from "express";
import jwt from "jsonwebtoken";
import { ENV } from "./env";

function isSecureRequest(req: Request) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto)
    ? forwardedProto
    : forwardedProto.split(",");
  return protoList.some(proto => proto.trim().toLowerCase() === "https");
}

export function getSessionCookieOptions(
  req: Request
): Pick<CookieOptions, "httpOnly" | "path" | "sameSite" | "secure"> {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req),
  };
}

export function createAdminToken(): string {
  return jwt.sign({ role: "admin" }, ENV.cookieSecret, { expiresIn: "365d" });
}

export function verifyAdminToken(token: string): boolean {
  try {
    jwt.verify(token, ENV.cookieSecret);
    return true;
  } catch {
    return false;
  }
}
