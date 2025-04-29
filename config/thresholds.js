export const functionalThresholdsSettings = {};

export const nftThresholdsSettings = {
  http_req_failed: [{ threshold: "rate<0.01", abortOnFail: false }],
  http_req_duration: ["p(95)<300"],
};
