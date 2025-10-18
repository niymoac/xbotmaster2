
import { NextRequest } from "next/server";
import { requestMiddleware, responseRedirect, getRequestIp } from "@/lib/api-utils";
import { createErrorResponse, createAuthResponse } from "@/lib/create-response";
import { generateToken, authCrudOperations, verifyToken } from "@/lib/auth";
import { generateRandomString, pbkdf2Hash } from "@/lib/server-utils";
import { REFRESH_TOKEN_EXPIRE_TIME } from "@/constants/auth";
import { z } from "zod";
import { userRegisterCallback } from "@/lib/user-register";

export const GET = requestMiddleware(async (request: NextRequest) => {
  try {
    const ip = getRequestIp(request);
    const userAgent = request.headers.get("user-agent") || "unknown";

    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    const loginUrl = new URL("/login", request.url).href;
    const homeUrl = new URL("/", request.url).href;

    // Handle OAuth errors
    if (error) {
      console.error("Twitter OAuth error:", error);
      return responseRedirect(loginUrl);
    }

    if (!code || !state) {
      return responseRedirect(loginUrl);
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch("https://twitter.com/2/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        client_id: process.env.TWITTER_CLIENT_ID || "",
        client_secret: process.env.TWITTER_CLIENT_SECRET || "",
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/next_api/auth/twitter-callback`,
        code_verifier: request.headers.get("x-code-verifier") || "",
      }).toString(),
    });

    if (!tokenResponse.ok) {
      console.error("Token exchange failed:", await tokenResponse.text());
      return responseRedirect(loginUrl);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      return responseRedirect(loginUrl);
    }

    // Get user info from Twitter API
    const userResponse = await fetch("https://api.twitter.com/2/users/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userResponse.ok) {
      console.error("User info fetch failed:", await userResponse.text());
      return responseRedirect(loginUrl);
    }

    const userData = await userResponse.json();
    const twitterUserId = userData.data?.id;
    const twitterUsername = userData.data?.username;

    if (!twitterUserId || !twitterUsername) {
      return responseRedirect(loginUrl);
    }

    const { usersCrud, sessionsCrud, refreshTokensCrud } =
      await authCrudOperations();

    // Find or create user by Twitter username
    const users = await usersCrud.findMany({ email: `twitter_${twitterUsername}` });
    let user = users?.[0];

    if (!user) {
      const newUserData = {
        email: `twitter_${twitterUsername}`,
        password: "NOT-SET",
      };

      user = await usersCrud.create(newUserData);

      // Custom extension hooks after user registration
      await userRegisterCallback(user);
    }

    // Create session
    const sessionData = {
      user_id: user.id,
      ip: ip,
      user_agent: userAgent,
    };
    const session = await sessionsCrud.create(sessionData);
    const sessionId = session.id;

    // Generate tokens
    const jwtAccessToken = await generateToken({
      sub: user.id,
      role: user.role,
      email: user.email,
    });

    const refreshToken = await generateRandomString();
    const hashedRefreshToken = await pbkdf2Hash(refreshToken);

    const refreshTokenData = {
      user_id: user.id,
      session_id: sessionId,
      token: hashedRefreshToken,
      expires_at: new Date(
        Date.now() + REFRESH_TOKEN_EXPIRE_TIME * 1000
      ).toISOString(),
    };

    await refreshTokensCrud.create(refreshTokenData);

    return createAuthResponse(
      { accessToken: jwtAccessToken, refreshToken },
      homeUrl
    );
  } catch (error) {
    console.error("Twitter callback error:", error);
    return createErrorResponse({
      errorMessage: "Twitter login failed. Please try again later",
      status: 500,
    });
  }
}, false);
