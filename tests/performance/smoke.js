import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: Number(__ENV.VUS || 5),
  duration: __ENV.DURATION || "30s",
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<1000"],
    checks: ["rate>0.99"],
  },
};

export default function smokeScenario() {
  const health = http.get(`${__ENV.APP_URL}/api/health`);
  check(health, { "health returns 200": (response) => response.status === 200 });

  const catalog = http.get(`${__ENV.APP_URL}/products`);
  check(catalog, { "catalog returns 200": (response) => response.status === 200 });
  sleep(1);
}
