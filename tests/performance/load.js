import http from "k6/http";
import { check, sleep } from "k6";

// Keep the performance trial below the production WAF limit; rate-limit
// detection is recorded as a separate security-control experiment.
const baselineVUs = Number.parseInt(__ENV.BASELINE_VUS || "2", 10);
const peakVUs = Number.parseInt(__ENV.PEAK_VUS || "3", 10);

export const options = {
  scenarios: {
    bounded_load: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: __ENV.WARMUP_DURATION || "1m", target: baselineVUs },
        { duration: __ENV.STAGE_DURATION || "2m", target: baselineVUs },
        { duration: __ENV.STAGE_DURATION || "2m", target: peakVUs },
        { duration: __ENV.STAGE_DURATION || "2m", target: peakVUs },
        { duration: __ENV.RECOVERY_DURATION || "2m", target: 0 },
      ],
      gracefulRampDown: "30s",
    },
  },
  thresholds: {
    http_req_failed: [{ threshold: "rate<0.01", abortOnFail: true, delayAbortEval: "30s" }],
    http_req_duration: ["p(95)<1000"],
    checks: ["rate>0.99"],
  },
  tags: {
    experiment_id: __ENV.EXPERIMENT_ID || "unknown",
    trial: __ENV.TRIAL_ID || "1",
  },
};

export default function loadScenario() {
  const catalog = http.get(`${__ENV.APP_URL}/products`, {
    tags: { endpoint: "catalog" },
  });
  check(catalog, { "catalog returns 200": (response) => response.status === 200 });

  const health = http.get(`${__ENV.APP_URL}/api/health`, {
    tags: { endpoint: "health" },
  });
  check(health, { "health returns 200": (response) => response.status === 200 });
  sleep(1);
}
