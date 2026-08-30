import redisClient from '../config/redis.js';

/**
 * Redis Service - Handles all Redis operations
 * Organized by feature for better scalability
 */

class RedisService {
  /**
   * Generic Redis Methods
   */

  async set(key, value, expirySeconds = null) {
    try {
      const serialized = JSON.stringify(value);
      if (expirySeconds) {
        await redisClient.setEx(key, expirySeconds, serialized);
      } else {
        await redisClient.set(key, serialized);
      }
      return true;
    } catch (error) {
      console.error(`Redis SET error for key ${key}:`, error);
      throw error;
    }
  }

  async get(key) {
    try {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Redis GET error for key ${key}:`, error);
      throw error;
    }
  }

  async delete(key) {
    try {
      await redisClient.del(key);
      return true;
    } catch (error) {
      console.error(`Redis DELETE error for key ${key}:`, error);
      throw error;
    }
  }

  async exists(key) {
    try {
      return await redisClient.exists(key);
    } catch (error) {
      console.error(`Redis EXISTS error for key ${key}:`, error);
      throw error;
    }
  }

  async ttl(key) {
    try {
      return await redisClient.ttl(key);
    } catch (error) {
      console.error(`Redis TTL error for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * OTP Management
   * Stores OTPs with expiry, attempts tracking, and limits
   */

  async setOTP(email, otp, expirySeconds = 600) {
    // 10 minutes default
    const key = `otp:${email}`;
    const data = {
      otp,
      createdAt: new Date().toISOString(),
      attempts: 0,
    };
    return this.set(key, data, expirySeconds);
  }

  async getOTP(email) {
    const key = `otp:${email}`;
    return this.get(key);
  }

  async verifyOTP(email, otp) {
    const key = `otp:${email}`;
    const data = await this.get(key);

    if (!data) {
      return { valid: false, message: 'OTP expired or not found' };
    }

    // Increment attempts
    data.attempts = (data.attempts || 0) + 1;

    // Max 5 attempts
    if (data.attempts > 5) {
      await this.delete(key);
      return { valid: false, message: 'Too many failed attempts. OTP expired.' };
    }

    if (data.otp !== otp) {
      await this.set(key, data); // Update attempts
      return { valid: false, message: 'Invalid OTP', attempts: data.attempts };
    }

    // Valid OTP
    await this.delete(key);
    return { valid: true, message: 'OTP verified successfully' };
  }

  async deleteOTP(email) {
    const key = `otp:${email}`;
    return this.delete(key);
  }

  /**
   * Password Reset Token Management
   * Stores reset tokens with expiry
   */

  async setResetToken(email, token, expirySeconds = 1800) {
    // 30 minutes default
    const key = `reset-token:${email}`;
    const data = {
      token,
      createdAt: new Date().toISOString(),
    };
    return this.set(key, data, expirySeconds);
  }

  async getResetToken(email) {
    const key = `reset-token:${email}`;
    return this.get(key);
  }

  async verifyResetToken(email, token) {
    const data = await this.getResetToken(email);

    if (!data) {
      return { valid: false, message: 'Reset token expired or not found' };
    }

    if (data.token !== token) {
      return { valid: false, message: 'Invalid reset token' };
    }

    return { valid: true, message: 'Reset token verified' };
  }

  async deleteResetToken(email) {
    const key = `reset-token:${email}`;
    return this.delete(key);
  }

  /**
   * Email Verification Token Management
   * Stores temporary email change tokens
   */

  async setEmailChangeToken(userId, newEmail, token, expirySeconds = 1800) {
    // 30 minutes default
    const key = `email-change:${userId}`;
    const data = {
      newEmail,
      token,
      createdAt: new Date().toISOString(),
    };
    return this.set(key, data, expirySeconds);
  }

  async getEmailChangeToken(userId) {
    const key = `email-change:${userId}`;
    return this.get(key);
  }

  async verifyEmailChangeToken(userId, token) {
    const data = await this.getEmailChangeToken(userId);

    if (!data) {
      return { valid: false, message: 'Email change token expired' };
    }

    if (data.token !== token) {
      return { valid: false, message: 'Invalid email change token' };
    }

    return {
      valid: true,
      message: 'Email change token verified',
      newEmail: data.newEmail,
    };
  }

  async deleteEmailChangeToken(userId) {
    const key = `email-change:${userId}`;
    return this.delete(key);
  }

  /**
   * Session Management
   * Stores user session data (alternative to JWT in cookies)
   */

  async setSession(sessionId, userData, expirySeconds = 86400) {
    // 24 hours default
    const key = `session:${sessionId}`;
    return this.set(key, userData, expirySeconds);
  }

  async getSession(sessionId) {
    const key = `session:${sessionId}`;
    return this.get(key);
  }

  async deleteSession(sessionId) {
    const key = `session:${sessionId}`;
    return this.delete(key);
  }

  async extendSession(sessionId, expirySeconds = 86400) {
    const key = `session:${sessionId}`;
    const data = await this.get(key);
    if (data) {
      return this.set(key, data, expirySeconds);
    }
    return false;
  }

  /**
   * Rate Limiting
   * Prevents abuse with attempt limiting
   */

  async recordAttempt(identifier, action, maxAttempts = 5, windowSeconds = 3600) {
    // 1 hour window default
    const key = `rate-limit:${action}:${identifier}`;
    const current = await this.get(key);
    const attempts = (current?.attempts || 0) + 1;

    if (attempts >= maxAttempts) {
      return {
        allowed: false,
        attempts,
        remaining: 0,
        message: `Too many ${action} attempts. Try again later.`,
      };
    }

    await this.set(
      key,
      { attempts, startedAt: current?.startedAt || new Date().toISOString() },
      windowSeconds
    );

    return {
      allowed: true,
      attempts,
      remaining: maxAttempts - attempts,
    };
  }

  async getRateLimitStatus(identifier, action) {
    const key = `rate-limit:${action}:${identifier}`;
    const data = await this.get(key);
    return data || { attempts: 0 };
  }

  async resetRateLimit(identifier, action) {
    const key = `rate-limit:${action}:${identifier}`;
    return this.delete(key);
  }

  /**
   * Temporary User Data Cache
   * Stores user data during signup/verification flow
   */

  async setTempUserData(email, userData, expirySeconds = 3600) {
    // 1 hour default
    const key = `temp-user:${email}`;
    return this.set(key, userData, expirySeconds);
  }

  async getTempUserData(email) {
    const key = `temp-user:${email}`;
    return this.get(key);
  }

  async deleteTempUserData(email) {
    const key = `temp-user:${email}`;
    return this.delete(key);
  }

  /**
   * User Session Cache
   * Stores user profile data for quick access
   */

  async setUserCache(userId, userData, expirySeconds = 3600) {
    // 1 hour default
    const key = `user-cache:${userId}`;
    return this.set(key, userData, expirySeconds);
  }

  async getUserCache(userId) {
    const key = `user-cache:${userId}`;
    return this.get(key);
  }

  async deleteUserCache(userId) {
    const key = `user-cache:${userId}`;
    return this.delete(key);
  }

  async invalidateUserCache(userId) {
    return this.deleteUserCache(userId);
  }

  /**
   * Token Blacklist (for logout)
   * Stores invalidated tokens
   */

  async blacklistToken(token, expirySeconds = 86400) {
    // 24 hours default
    const key = `blacklist:${token}`;
    return this.set(key, { blacklistedAt: new Date().toISOString() }, expirySeconds);
  }

  async isTokenBlacklisted(token) {
    const key = `blacklist:${token}`;
    return this.exists(key);
  }

  /**
   * Email Verification State
   * Tracks temporary email during change process
   */

  async setPendingEmailChange(userId, newEmail, expirySeconds = 1800) {
    const key = `pending-email:${userId}`;
    return this.set(key, { newEmail, createdAt: new Date().toISOString() }, expirySeconds);
  }

  async getPendingEmailChange(userId) {
    const key = `pending-email:${userId}`;
    return this.get(key);
  }

  async deletePendingEmailChange(userId) {
    const key = `pending-email:${userId}`;
    return this.delete(key);
  }

  /**
   * Verification Status Cache
   * Quick lookup for email verification status
   */

  async setVerificationStatus(email, isVerified) {
    const key = `verified:${email}`;
    const ttl = isVerified ? 86400 * 30 : 3600; // 30 days if verified, 1 hour if not
    return this.set(key, { verified: isVerified, checkedAt: new Date().toISOString() }, ttl);
  }

  async getVerificationStatus(email) {
    const key = `verified:${email}`;
    return this.get(key);
  }

  /**
   * Cleanup & Maintenance
   * Useful for admin operations
   */

  async flushDB() {
    try {
      await redisClient.flushDb();
      return true;
    } catch (error) {
      console.error('Redis FLUSHDB error:', error);
      throw error;
    }
  }

  async getAllKeys(pattern = '*') {
    try {
      return await redisClient.keys(pattern);
    } catch (error) {
      console.error('Redis KEYS error:', error);
      throw error;
    }
  }

  async getStats() {
    try {
      const info = await redisClient.info();
      return info;
    } catch (error) {
      console.error('Redis INFO error:', error);
      throw error;
    }
  }
}

export default new RedisService();