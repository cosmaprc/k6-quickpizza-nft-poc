export const functionalThresholdsSettings = {};

export const nftThresholdsSettings = {
  http_req_failed: [{ threshold: "rate<1.00", abortOnFail: false }],
  http_req_duration: ["p(95)<300", "p(99)<1000"],
};
