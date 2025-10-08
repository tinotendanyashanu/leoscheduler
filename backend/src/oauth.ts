import { SignJWT, jwtVerify } from "jose";

export type Env = {
  KV_TOKENS: KVNamespace;
  KV_POSTS: KVNamespace;
  X_CLIENT_ID: string;
  X_REDIRECT_URI: string;
  X_CLIENT_SECRET: string; // secret
  JWT_SIGNING_KEY: string; // secret
  X_API_BASE?: string;
  APP_ORIGIN: string;
};

const X_AUTH = "https://twitter.com/i/oauth2/authorize";
const X_TOKEN = "https://api.x.com/2/oauth2/token"; // default, can be overridden

function base64urlRandom(bytes = 32) {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return btoa(String.fromCharCode(...arr))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

async function sha256Base64Url(plain: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  const digest = await crypto.subtle.digest("SHA-256", data);
  
  const hash = new Uint8Array(digest);
  let str = "";
  hash.forEach(b => (str += String.fromCharCode(b)));
  return btoa(str)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

export const oauth = {
  async createAuthUrl(clientId: string, baseUrl: string): Promise<{ authUrl: string; state: string; codeVerifier: string }> {
    const state = base64urlRandom();
    const codeVerifier = base64urlRandom();
    const codeChallenge = await sha256Base64Url(codeVerifier);
    
    const authParams = new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      redirect_uri: `${baseUrl}/auth/callback`,
      scope: "tweet.read tweet.write users.read offline.access",
      state: state,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    });

    return {
      authUrl: `${X_AUTH}?${authParams}`,
      state,
      codeVerifier,
    };
  },

  async exchangeCodeForTokens(code: string, codeVerifier: string, clientId: string, clientSecret: string, baseUrl: string) {
    const tokenParams = new URLSearchParams({
      grant_type: "authorization_code",
      code: code,
      redirect_uri: `${baseUrl}/auth/callback`,
      client_id: clientId,
      code_verifier: codeVerifier,
    });

    const response = await fetch(X_TOKEN, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      },
      body: tokenParams.toString(),
    });

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.status}`);
    }

    return await response.json();
  },

  async refreshTokens(refreshToken: string, clientId: string, clientSecret: string) {
    const tokenParams = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: clientId,
    });

    const response = await fetch(X_TOKEN, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      },
      body: tokenParams.toString(),
    });

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.status}`);
    }

    return await response.json();
  },

  async createJWT(userId: string, secret: string): Promise<string> {
    return new SignJWT({ sub: userId })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(new TextEncoder().encode(secret));
  },

  async verifyJWT(jwt: string, secret: string) {
    try {
      const { payload } = await jwtVerify(jwt, new TextEncoder().encode(secret));
      return payload;
    } catch {
      return null;
    }
  }
};