import User from "../models/userModel.js";
import redisClient from "../config/redis.js";
import { ACCESS_TOKEN_COOKIE, verifyAccessToken } from "../utils/token.js";
import { sanitizeUser } from "../utils/validators.js";

const USER_CACHE_TTL_SECONDS = 60;
const memoryUserCache = new Map();

const getUserCacheKey = (userId) => `auth:user:${userId}`;

const normalizeCachedUser = (user) => {
  if (!user) return null;
  if (user._id) return user;

  return {
    ...user,
    _id: user.id,
  };
};

const getCachedUser = async (userId) => {
  if (!userId) return null;

  const cachedMemory = memoryUserCache.get(userId);
  if (cachedMemory && cachedMemory.expiresAt > Date.now()) {
    return normalizeCachedUser(cachedMemory.user);
  }

  if (cachedMemory) memoryUserCache.delete(userId);

  try {
    const cached = await redisClient.get(getUserCacheKey(userId));
    if (!cached) return null;

    const user = normalizeCachedUser(JSON.parse(cached));
    if (!user) return null;

    memoryUserCache.set(userId, {
      user,
      expiresAt: Date.now() + USER_CACHE_TTL_SECONDS * 1000,
    });

    return user;
  } catch (error) {
    console.error("User cache read failed:", error.message);
    return null;
  }
};

const setCachedUser = async (user) => {
  if (!user || !user._id) return;

  const userId = user._id.toString();
  const safeUser = sanitizeUser(user);
  const payload = normalizeCachedUser(safeUser);

  memoryUserCache.set(userId, {
    user: payload,
    expiresAt: Date.now() + USER_CACHE_TTL_SECONDS * 1000,
  });

  try {
    await redisClient.set(
      getUserCacheKey(userId),
      JSON.stringify(payload),
      "EX",
      USER_CACHE_TTL_SECONDS
    );
  } catch (error) {
    console.error("User cache write failed:", error.message);
  }
};

const clearCachedUser = async (userId) => {
  if (!userId) return;

  memoryUserCache.delete(userId);

  try {
    await redisClient.del(getUserCacheKey(userId));
  } catch (error) {
    console.error("User cache delete failed:", error.message);
  }
};

/**
 * Protects routes. The token is read from the HTTP-only cookie that the browser
 * sends automatically — never from a header or body supplied by React.
 *
 * Any failure (missing, malformed, invalid, expired) returns 401 with the same
 * generic message, so the response does not describe why a token was rejected.
 */
const protect = async (req, res, next) => {
  try {
    const token = req.cookies?.[ACCESS_TOKEN_COOKIE];

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }

    const payload = verifyAccessToken(token);

    const cachedUser = await getCachedUser(payload.id);
    if (cachedUser) {
      req.user = cachedUser;
      return next();
    }

    // Load the user fresh so a deleted or changed account cannot keep a session.
    const user = await User.findById(payload.id);

    if (!user) {
      await clearCachedUser(payload.id);
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }

    req.user = user;
    await setCachedUser(user);
    return next();
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, message: "Not authenticated" });
  }
};

export default protect;
export { clearCachedUser, setCachedUser, getCachedUser };
