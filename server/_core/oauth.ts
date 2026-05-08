import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import { createAdminToken, getSessionCookieOptions } from "./cookies";
import { ENV } from "./env";

export function registerOAuthRoutes(app: Express) {
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    const { password } = req.body;

    if (!password || password !== ENV.adminPassword) {
      res.status(401).json({ error: "Invalid password" });
      return;
    }

    const token = createAdminToken();
    const cookieOptions = getSessionCookieOptions(req);
    res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });
    res.json({ success: true });
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    res.clearCookie(COOKIE_NAME);
    res.json({ success: true });
  });

  app.get("/api/auth/me", (req: Request, res: Response) => {
    const token = req.cookies?.[COOKIE_NAME];
    if (token) {
      try {
        const { verifyAdminToken } = require("./cookies");
        if (verifyAdminToken(token)) {
          res.json({ role: "admin" });
          return;
        }
      } catch {}
    }
    res.json({ role: null });
  });
}
