import jwt from "jsonwebtoken";

export const ACCESS_TOKEN_COOKIE = "accessToken";

/** Cookie lifetime, kept in one place so login and logout cannot drift apart. */
const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Cookie options.
 *
 * httpOnly    JavaScript in the browser cannot read the cookie, so an XSS bug
 *             cannot steal the session token.
 * secure      true in production (HTTPS only), false locally over plain HTTP.
 * sameSite    "lax" is right when the client and API share a site. Set
 *             COOKIE_SAME_SITE=none when they are on different sites in
 *             production — "none" also requires secure: true.
 *
 * clearCookie must be called with the same options, otherwise the browser
 * keeps the old cookie.
 */
export const cookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";
  const sameSite = process.env.COOKIE_SAME_SITE || (isProduction ? "none" : "lax");

  return {
    httpOnly: true,
    secure: isProduction || sameSite === "none",
    sameSite,
    maxAge: COOKIE_MAX_AGE_MS,
    path: "/",
  };
};

export const signAccessToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    const error = new Error("JWT_SECRET is missing. Add it to server/.env");
    error.statusCode = 500;
    throw error;
  }

  return jwt.sign({ id: String(userId) }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

/** Issues the JWT and attaches it to the response as an HTTP-only cookie. */
export const setAuthCookie = (res, userId) => {
  res.cookie(ACCESS_TOKEN_COOKIE, signAccessToken(userId), cookieOptions());
};

export const clearAuthCookie = (res) => {
  // maxAge must not be sent when clearing; the rest must match exactly.
  const { maxAge, ...options } = cookieOptions();
  res.clearCookie(ACCESS_TOKEN_COOKIE, options);
};

export const verifyAccessToken = (token) =>
  jwt.verify(token, process.env.JWT_SECRET);
