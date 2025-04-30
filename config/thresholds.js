export const functionalThresholdsSettings = {};

// 50% of requests should be below 50ms, 95% below 300ms and 99% below 1s
const REQ_DURATION_THRESHOLDS = ["p(50)<50", "p(95)<300", "p(99)<1000"];

export const nftThresholdsSettings = {
  http_req_failed: [{ threshold: "rate<0.01", abortOnFail: false }], // http errors should be less than 1%
  http_req_duration: REQ_DURATION_THRESHOLDS,
  "http_req_duration{url:/api/pizza,method:POST}": REQ_DURATION_THRESHOLDS, // Slow endpoint
  "http_req_duration{url:/api/users/token/login,method:POST}":
    REQ_DURATION_THRESHOLDS,
  "http_req_duration{url:/api/ratings,method:POST}": REQ_DURATION_THRESHOLDS,
  "http_req_duration{url:/api/ratings/{id},method:PUT}":
    REQ_DURATION_THRESHOLDS,
  "http_req_duration{url:/api/ratings/{id} ,method:DELETE}":
    REQ_DURATION_THRESHOLDS,
};
