import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  createSessionToken,
  verifySessionToken,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  type Session,
} from "./session";

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

export async function setSession(session: Session) {
  const store = await cookies();
  store.set(SESSION_COOKIE, createSessionToken(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function requireAdmin(): Promise<Session & { role: "admin" }> {
  const session = await requireSession();
  if (session.role !== "admin") redirect("/");
  return session as Session & { role: "admin" };
}
