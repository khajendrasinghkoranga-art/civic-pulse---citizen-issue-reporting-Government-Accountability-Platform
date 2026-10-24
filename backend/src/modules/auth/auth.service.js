const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authRepository = require("./auth.repository");

// ── Token helpers ──

const generateAccessToken = (id) => {
  const expiresIn = (process.env.JWT_EXPIRES_IN || "7d").trim();
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn,
  });
};

const generateRefreshToken = () => {
  return crypto.randomBytes(40).toString("hex");
};

const REFRESH_TOKEN_EXPIRES_DAYS = parseInt(process.env.REFRESH_TOKEN_EXPIRES_DAYS || "30", 10);

// ============================================================
// Register
// ============================================================

const registerUser = async (data) => {
  // Check if user already exists
  const email = data.email.trim().toLowerCase();
  const userExists = await authRepository.findUserByEmail(email);

  if (userExists) {
    throw new Error("User already exists with this email");
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(data.password, salt);

  // Create user
  const user = await authRepository.createUser({
    name: data.name,
    email,
    passwordHash: passwordHash,
    phone: data.phone,
    role: "CITIZEN",
  });

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken();

  // Persist refresh token
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000);
  await authRepository.createRefreshToken({
    token: refreshToken,
    userId: user.id,
    expiresAt,
  });

  return { user, accessToken, refreshToken };
};

// ============================================================
// Login
// ============================================================

const loginUser = async (email, password) => {
  // Find user
  const user = await authRepository.findUserByEmail(email.trim().toLowerCase());

  if (!user) {
    throw new Error("Invalid credentials");
  }

  if (!user.isActive) {
    throw new Error("User account is disabled");
  }

  // Check password
  const isMatch = await bcrypt.compare(password, user.passwordHash);

  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken();

  // Persist refresh token
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000);
  await authRepository.createRefreshToken({
    token: refreshToken,
    userId: user.id,
    expiresAt,
  });

  // Return user without passwordHash
  const { passwordHash, ...userWithoutPassword } = user;

  return { user: userWithoutPassword, accessToken, refreshToken };
};

// ============================================================
// Refresh Token
// ============================================================

const refreshAccessToken = async (token) => {
  if (!token) {
    throw new Error("Refresh token is required");
  }

  const storedToken = await authRepository.findRefreshToken(token);

  if (!storedToken) {
    throw new Error("Invalid refresh token");
  }

  if (storedToken.revokedAt) {
    // Token reuse detected – revoke all tokens for this user (security measure)
    await authRepository.revokeAllUserRefreshTokens(storedToken.userId);
    throw new Error("Refresh token has been revoked");
  }

  if (new Date() > storedToken.expiresAt) {
    await authRepository.revokeRefreshToken(token);
    throw new Error("Refresh token has expired");
  }

  // Rotate: revoke old token and issue new pair
  await authRepository.revokeRefreshToken(token);

  const newAccessToken = generateAccessToken(storedToken.userId);
  const newRefreshToken = generateRefreshToken();
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000);

  await authRepository.createRefreshToken({
    token: newRefreshToken,
    userId: storedToken.userId,
    expiresAt,
  });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

// ============================================================
// Logout
// ============================================================

const logoutUser = async (refreshToken) => {
  if (refreshToken) {
    const stored = await authRepository.findRefreshToken(refreshToken);
    if (stored && !stored.revokedAt) {
      await authRepository.revokeRefreshToken(refreshToken);
    }
  }
};

// ============================================================
// Logout All Sessions
// ============================================================

const logoutAllSessions = async (userId) => {
  await authRepository.revokeAllUserRefreshTokens(userId);
};

// ============================================================
// Change Password
// ============================================================

const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await authRepository.findUserById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isMatch) {
    throw new Error("Current password is incorrect");
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(newPassword, salt);

  await authRepository.updateUserPassword(userId, passwordHash);

  // Revoke all existing refresh tokens (force re-login on other devices)
  await authRepository.revokeAllUserRefreshTokens(userId);
};

// ============================================================
// Get Current User (from token)
// ============================================================

const getCurrentUser = async (userId) => {
  const user = await authRepository.findUserById(userId);
  if (!user) {
    throw new Error("User not found");
  }
  const { passwordHash, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

// ============================================================
// Real Google Authentication via Token Exchange (RFC 6749 & OIDC)
// ============================================================

const googleAuth = async ({ code, redirectUri, idToken, accessToken, credential, email, name }) => {
  let verifiedEmail = email;
  let verifiedName = name;
  let googleSubjectId = null;

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  // 1. Authorization Code Exchange Flow (Standard OAuth 2.0 Token Exchange)
  if (code) {
    try {
      console.log("Exchanging Google authorization code for tokens...");
      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: clientId || "",
          client_secret: clientSecret || "",
          redirect_uri: redirectUri || "postmessage",
          grant_type: "authorization_code",
        }),
      });

      const tokenData = await tokenResponse.json();

      if (!tokenResponse.ok) {
        throw new Error(tokenData.error_description || tokenData.error || "Failed to exchange Google authorization code");
      }

      // Fetch user profile from Google using the exchanged access token
      if (tokenData.access_token) {
        const profileRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });

        if (profileRes.ok) {
          const profile = await profileRes.json();
          verifiedEmail = profile.email;
          verifiedName = profile.name || verifiedName;
          googleSubjectId = profile.sub;
        }
      }

      // Also decode ID token if present
      if (!verifiedEmail && tokenData.id_token) {
        const idTokenRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${tokenData.id_token}`);
        if (idTokenRes.ok) {
          const idInfo = await idTokenRes.json();
          verifiedEmail = idInfo.email;
          verifiedName = idInfo.name || verifiedName;
          googleSubjectId = idInfo.sub;
        }
      }
    } catch (err) {
      console.error("Google code exchange error:", err);
      throw new Error(`Google token exchange failed: ${err.message}`);
    }
  }

  // 2. Google ID Token / Credential Verification (Google Identity Services)
  const tokenToVerify = idToken || credential;
  if (!verifiedEmail && tokenToVerify) {
    try {
      const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${tokenToVerify}`);
      if (response.ok) {
        const payload = await response.json();
        if (payload.email) {
          verifiedEmail = payload.email;
          verifiedName = payload.name || verifiedName;
          googleSubjectId = payload.sub;
        }
      } else {
        const errPayload = await response.json();
        console.warn("Google tokeninfo response error:", errPayload);
      }
    } catch (err) {
      console.warn("Google tokeninfo fetch error:", err.message);
    }
  }

  // 3. Google Access Token Verification
  if (!verifiedEmail && accessToken) {
    try {
      const profileRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (profileRes.ok) {
        const profile = await profileRes.json();
        verifiedEmail = profile.email;
        verifiedName = profile.name || verifiedName;
        googleSubjectId = profile.sub;
      }
    } catch (err) {
      console.warn("Google userinfo fetch error:", err.message);
    }
  }

  if (!verifiedEmail) {
    throw new Error("Could not verify Google account. Please ensure a valid Google code or token is provided.");
  }

  const cleanEmail = verifiedEmail.trim().toLowerCase();
  let user = await authRepository.findUserByEmail(cleanEmail);

  // If user doesn't exist, create citizen account automatically
  if (!user) {
    const salt = await bcrypt.genSalt(10);
    const randomPassword = crypto.randomBytes(24).toString("hex");
    const passwordHash = await bcrypt.hash(randomPassword, salt);

    user = await authRepository.createUser({
      name: verifiedName || cleanEmail.split("@")[0],
      email: cleanEmail,
      passwordHash,
      role: "CITIZEN",
      isVerified: true,
      identityVerified: true,
    });
  }

  if (!user.isActive) {
    throw new Error("User account is disabled");
  }

  const generatedAccessToken = generateAccessToken(user.id);
  const generatedRefreshToken = generateRefreshToken();

  // Persist refresh token
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000);
  await authRepository.createRefreshToken({
    token: generatedRefreshToken,
    userId: user.id,
    expiresAt,
  });

  const { passwordHash, ...userWithoutPassword } = user;
  return {
    user: userWithoutPassword,
    accessToken: generatedAccessToken,
    refreshToken: generatedRefreshToken,
    googleSub: googleSubjectId,
  };
};

module.exports = {
  registerUser,
  loginUser,
  googleAuth,
  refreshAccessToken,
  logoutUser,
  logoutAllSessions,
  changePassword,
  getCurrentUser,
};

