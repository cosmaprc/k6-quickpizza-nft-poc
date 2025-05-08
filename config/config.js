import {
  functionalThresholdsSettings,
  nftThresholdsSettings,
} from "./thresholds.js";
import {
  spikeWorkload,
  testWorkload,
} from "./workloads.js";

/*global __ENV*/
const ENV_CONFIG = __ENV.ENVIRONMENT || "test";

const EnvConfig = {
  test: {
    BASE_URL: "http://localhost:3333",
  },
  dev: {
    BASE_URL: "http://localhost:3333",
  },
  prod: {
    BASE_URL: "https://quickpizza.grafana.com",
  },
};

const Config = EnvConfig[ENV_CONFIG];

export const BASE_URL = Config.BASE_URL;

export const WORKLOAD = ENV_CONFIG !== "test" ? spikeWorkload : testWorkload;
export const CRUD_PIZZA_RATING_WORKLOAD =
  ENV_CONFIG !== "test"
    ? spikeWorkload
    : testWorkload;
export const CREATE_AND_LOGIN_USER_WORKLOAD =
  ENV_CONFIG !== "test"
    ? spikeWorkload
    : testWorkload;

export const THRESHOLDS =
  ENV_CONFIG !== "test" ? nftThresholdsSettings : functionalThresholdsSettings;
