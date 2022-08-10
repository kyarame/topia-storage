import type { VercelRequest, VercelResponse } from "@vercel/node";
import fetch from "node-fetch";

const API_KEY = "AIzaSyAflEZ-NOmqUuuyUlWZbe6w7N7Xs1ugfk8";
const PACKAGE_NAME = "jp.co.unbereal.enlil";

const USER_AGENT =
  "Dalvik/2.1.0 (Linux; U; Android 123; MyModel Build/PQ3A.190801.002)";

async function signupNewUser() {
  const result = await fetch(
    `https://www.googleapis.com/identitytoolkit/v3/relyingparty/signupNewUser?key=${API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Android-Package": PACKAGE_NAME,
        "X-Android-Cert": "631F35ED04033CB0C7D0C9218EFDA1FA2CC57800",
        "Accept-Language": "en-US",
        "X-Client-Version": "Android/Fallback/X20000004/FirebaseCore-Android",
        "User-Agent": USER_AGENT,
        "Connection": "Keep-Alive",
        "Accept-Encoding": "gzip",
      },
      body: "{}",
    },
  ).then((r) => r.json()) as {
    kind: "identitytoolkit#SignupNewUserResponse";
    idToken: string;
    refreshToken: string;
    expiresIn: string; // in seconds, stringified
    localId: string;
    error?: never;
  } | {
    error: {
      code: number;
      message: string;
      errors: { message: string; domain: string; reason: string }[];
    };
  };
  if (result.error) {
    throw result;
  }
  return result;
}

async function refreshIdToken(refreshToken: string) {
  return await fetch(
    `https://securetoken.googleapis.com/v1/token?key=${API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Android-Package": PACKAGE_NAME,
        "X-Android-Cert": "631F35ED04033CB0C7D0C9218EFDA1FA2CC57800",
        "Accept-Language": "en-US",
        "X-Client-Version": "Android/Fallback/X20000004/FirebaseCore-Android",
        "User-Agent": USER_AGENT,
        "Connection": "Keep-Alive",
        "Accept-Encoding": "gzip",
      },
      body: JSON.stringify({
        "grantType": "refresh_token",
        "refreshToken": refreshToken,
      }),
    },
  ).then((r) => r.json()) as {
    "access_token": string;
    "expires_in": string;
    "token_type": "Bearer";
    "refresh_token": string;
    "id_token": string; // equal to access_token
    "user_id": string;
    "project_id": string; // stringified number
  };
}

export default async (request: VercelRequest, response: VercelResponse) => {
  if (request.method !== "GET") {
    response.status(400).json({
      message: "Only GET is supported",
    });
    return;
  }
  try {
    const { refreshToken } = request.query;

    if (refreshToken) {
      const result = await refreshIdToken(refreshToken as string);
      response.status(200).json({
        refreshIdToken: result.refresh_token,
        accessToken: result.access_token,
        accessTokenExpiresAt: Date.now() + 30 * 60 * 1000,
      });
    } else {
      const result = await signupNewUser();
      response.status(200).json({
        refreshIdToken: result.refreshToken,
        accessToken: result.idToken,
        accessTokenExpiresAt: Date.now() + 30 * 60 * 1000,
      });
    }
  } catch (e) {
    response.status(500).send(e);
  }
};
