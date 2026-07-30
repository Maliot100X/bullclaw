import crypto from 'crypto';

const MCP_URL = "https://clawpump-mcp-production.up.railway.app";
const REDIRECT_URI = "https://bullclaw.vercel.app/api/clawpump/callback";

export function generatePKCE() {
  const verifier = crypto.randomBytes(32).toString('base64url');
  const challenge = crypto.createHash('sha256').update(verifier).digest('base64url');
  return { verifier, challenge };
}

export async function registerClient() {
  const res = await fetch(MCP_URL + "/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_name: "bullclaw-" + Date.now(),
      redirect_uris: [REDIRECT_URI],
      grant_types: ["authorization_code", "refresh_token"],
      token_endpoint_auth_method: "none",
      response_types: ["code"],
    }),
  });
  return res.json();
}

export function getAuthUrl(clientId: string, codeChallenge: string) {
  return MCP_URL + "/authorize?" + new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: REDIRECT_URI,
    scope: "clawpump:agents",
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });
}

export async function exchangeCode(clientId: string, code: string, codeVerifier: string) {
  const res = await fetch(MCP_URL + "/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
      client_id: clientId,
      code_verifier: codeVerifier,
    }).toString(),
  });
  return res.json();
}

export async function callMCPTool(accessToken: string, tool: string, args: any = {}) {
  const res = await fetch(MCP_URL + "/mcp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + accessToken,
      "Mcp-Protocol-Version": "2024-11-05",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: { name: tool, arguments: args },
    }),
  });
  const data = await res.json();
  if (data?.result?.content?.[0]?.text) {
    try { return JSON.parse(data.result.content[0].text); }
    catch { return data.result.content[0].text; }
  }
  return data;
}
