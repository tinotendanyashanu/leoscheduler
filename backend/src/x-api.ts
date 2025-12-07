const X_API = "https://api.twitter.com";

export const xApi = {
  async getUserInfo(accessToken: string) {
    const res = await fetch(`${X_API}/2/users/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    
    if (!res.ok) throw new Error(`getUserInfo ${res.status} ${await res.text()}`);
    const data = await res.json<{ data: { id: string; name: string; username: string; profile_image_url?: string } }>();
    return data.data;
  },

  async refreshAccessToken(refreshToken: string, clientId: string, clientSecret: string) {
    const tokenParams = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: clientId,
    });

    const response = await fetch(`${X_API}/2/oauth2/token`, {
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

  async postTweet(accessToken: string, tweet: { text: string; media?: { media_ids: string[] }; reply?: { in_reply_to_tweet_id: string } }) {
    const res = await fetch(`${X_API}/2/tweets`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(tweet),
    });
    
    if (!res.ok) throw new Error(`postTweet ${res.status} ${await res.text()}`);
    return res.json<{ data: { id: string; text: string } }>();
  }
};