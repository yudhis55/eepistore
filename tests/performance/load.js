import http from "k6/http";
import { check, sleep } from "k6";

const maxVUs = 30;
const stageVUs = [
  Number.parseInt(__ENV.BASELINE_VUS || "2", 10),
  Number.parseInt(__ENV.STEP_1_VUS || "5", 10),
  Number.parseInt(__ENV.STEP_2_VUS || "10", 10),
  Number.parseInt(__ENV.STEP_3_VUS || "20", 10),
];
if (stageVUs.some((value) => !Number.isInteger(value) || value < 0 || value > maxVUs)) {
  throw new Error(`Every load stage must be an integer between 0 and ${maxVUs} VUs`);
}

export const options = {
  scenarios: {
    bounded_load: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: __ENV.WARMUP_DURATION || "3m", target: stageVUs[0] },
        { duration: __ENV.BASELINE_DURATION || "5m", target: stageVUs[0] },
        { duration: __ENV.STEP_1_DURATION || "5m", target: stageVUs[1] },
        { duration: __ENV.STEP_2_DURATION || "7m", target: stageVUs[2] },
        { duration: __ENV.STEP_3_DURATION || "10m", target: stageVUs[3] },
        { duration: __ENV.RECOVERY_DURATION || "1m", target: 0 },
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
