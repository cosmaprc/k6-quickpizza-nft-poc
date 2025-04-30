export const functionalThresholdsSettings = {};

export const nftThresholdsSettings = {
  http_req_failed: [{ threshold: "rate<0.01", abortOnFail: false }], // http errors should be less than 1%
  http_req_duration: ["p(95)<300", "p(99)<1000"], // 95% of requests should be below 300ms and 99% below 1s
};
