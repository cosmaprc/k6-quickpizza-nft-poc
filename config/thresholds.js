export const functionalThresholdsSettings = {};

// SLOs: 90% of requests should be below 300ms and 95% below 600
const REQ_DURATION_THRESHOLDS = ["p(90)<300", "p(95)<600"];

export const nftThresholdsSettings = {
  http_req_failed: [{ threshold: "rate<0.01", abortOnFail: false }], // http errors should be less than 1%, SLO
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
