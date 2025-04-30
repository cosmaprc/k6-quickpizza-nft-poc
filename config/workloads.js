export const spikeWorkload = {
  executor: "ramping-vus",
  startVUs: 0,
  stages: [
    { duration: "1m", target: 7 * 1 },
    { duration: "1m", target: 0 },
  ],
  gracefulRampDown: "0s",
};

export const stressWorkload = {
  executor: "ramping-vus",
  startVUs: 0,
  stages: [
    { duration: "1m", target: 10 * 7 },
    { duration: "2m", target: 10 * 7 },
    { duration: "1m", target: 0 },
  ],
  gracefulRampDown: "0s",
};

export const testWorkload = {
  executor: "shared-iterations",
  iterations: 1,
  vus: 1,
};

export const createAndLoginUserScenarioTestWorkload = {
  executor: "shared-iterations",
  exec: "createAndLoginUserScenario",
  iterations: 1,
  vus: 1,
};

export const createAndLoginUserScenarioSpikeWorkload = {
  exec: "createAndLoginUserScenario",
  executor: "ramping-vus",
  startVUs: 0,
  stages: [
    { duration: "1m", target: 10 * 2 },
    { duration: "2m", target: 10 * 2 },
    { duration: "1m", target: 0 },
  ],
  gracefulRampDown: "0s",
};

export const crudPizzaRatingScenarioTestWorkload = {
  exec: "crudPizzaRatingScenario",
  executor: "shared-iterations",
  iterations: 1,
  vus: 1,
};

export const crudPizzaRatingScenarioSpikeWorkload = {
  exec: "crudPizzaRatingScenario",
  executor: "ramping-vus",
  startVUs: 0,
  stages: [
    { duration: "1m", target: 10 * 5 },
    { duration: "2m", target: 10 * 5 },
    { duration: "1m", target: 0 },
  ],
  gracefulRampDown: "0s",
};
