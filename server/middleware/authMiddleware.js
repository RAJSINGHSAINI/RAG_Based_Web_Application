import User from "../models/userModel.js";
import { ACCESS_TOKEN_COOKIE, verifyAccessToken } from "../utils/token.js";

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

    // Load the user fresh so a deleted or changed account cannot keep a session.
    const user = await User.findById(payload.id);

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }

    req.user = user;
    return next();
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, message: "Not authenticated" });
  }
};

export default protect;
