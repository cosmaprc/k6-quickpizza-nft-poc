export const spikeWorkload = {
  executor: "ramping-vus",
  stages: [
    { duration: "30s", target: 2 }, // fast ramp-up to a high point
    // No plateau
    { duration: "15s", target: 0 }, // quick ramp-down to 0 users
  ],
};

export const testWorkload = {
  executor: "shared-iterations",
  iterations: 1,
  vus: 1,
};

export const createUserScenarioTestWorkload = {
  executor: "shared-iterations",
  exec: "createUserScenario",
  iterations: 1,
  vus: 1,
};

export const createUserScenarioSpikeWorkload = {
  exec: "createUserScenario",
  executor: "ramping-vus",
  stages: [
    { duration: "30s", target: 2 }, // fast ramp-up to a high point
    // No plateau
    { duration: "15s", target: 0 }, // quick ramp-down to 0 users
  ],
};

export const loginUserScenarioTestWorkload = {
  executor: "shared-iterations",
  exec: "loginUserScenario",
  iterations: 1,
  vus: 1,
};

export const loginUserScenarioSpikeWorkload = {
  exec: "loginUserScenario",
  executor: "ramping-vus",
  stages: [
    { duration: "30s", target: 2 }, // fast ramp-up to a high point
    // No plateau
    { duration: "15s", target: 0 }, // quick ramp-down to 0 users
  ],
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
  stages: [
    { duration: "30s", target: 2 }, // fast ramp-up to a high point
    // No plateau
    { duration: "15s", target: 0 }, // quick ramp-down to 0 users
  ],
};
