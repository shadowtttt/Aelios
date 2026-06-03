import { json } from "../utils/json";
import type { Env } from "../types";

const requiredTextVars = [
  "AI_GATEWAY_BASE_URL",
  "CHATBOX_API_KEY",
  "CF_AIG_TOKEN",
  "CLOUDFLARE_ACCOUNT_ID",
  "CLOUDFLARE_API_TOKEN",
  "CHAT_MODEL",
  "MEMORY_FILTER_MODEL",
  "VISION_MODEL"
] as const;

const requiredBindings = [
  ["d1", "DB"],
  ["workers_ai", "AI"],
] as const;

const optionalBindings = [
  ["vectorize", "VECTORIZE"],
  ["queue", "MEMORY_QUEUE"],
] as const;

export function handleHealth(env: Env): Response {
  const missing_text_vars: string[] = requiredTextVars.filter((name) => !env[name]);
  if (!env.DREAM_MODEL && !env.SUMMARY_MODEL && !env.DAILY_DIGEST_MODEL) {
    missing_text_vars.push("DREAM_MODEL");
  }
  const missing_bindings = requiredBindings
    .filter(([, binding]) => !env[binding])
    .map(([name]) => name);
  const missing_optional_bindings = optionalBindings
    .filter(([, binding]) => !env[binding])
    .map(([name]) => name);
  const ok = missing_text_vars.length === 0 && missing_bindings.length === 0;

  return json({
    ok,
    status: ok ? (missing_optional_bindings.length === 0 ? "ok" : "degraded") : "missing_configuration",
    service: "companion-memory-proxy",
    missing_text_vars,
    missing_bindings,
    missing_optional_bindings,
    bindings: {
      d1: Boolean(env.DB),
      vectorize: Boolean(env.VECTORIZE),
      queue: Boolean(env.MEMORY_QUEUE)
    }
  });
}
