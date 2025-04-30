import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";
import { randomString } from "https://jslib.k6.io/k6-utils/1.2.0/index.js";
// This will export to HTML as filename "result.html" AND also stdout using the text summary
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { group, sleep } from "k6";

import { makePizza } from "../api/pizza.js";
import {
  createRating,
  deleteRating,
  fetchRatings,
  updateRating,
} from "../api/ratings.js";
import { createUser, loginUser } from "../api/users.js";
import {
  BASE_URL,
  CREATE_AND_LOGIN_USER_WORKLOAD,
  CRUD_PIZZA_RATING_WORKLOAD,
  THRESHOLDS,
} from "../config/config.js";

export const options = {
  scenarios: {
    createAndLoginUserScenario: CREATE_AND_LOGIN_USER_WORKLOAD,
    crudPizzaRatingScenario: CRUD_PIZZA_RATING_WORKLOAD,
  },
  thresholds: THRESHOLDS,
};

export function handleSummary(data) {
  return {
    "result.html": htmlReport(data),
    stdout: textSummary(data, { indent: " ", enableColors: true }),
  };
}

export function setup() {
  const USERNAME = `${randomString(10)}@example.com`;
  const PASSWORD = "secret";
  let authToken = null; // This will be set after the user is created and logged in
  group("Users setup operations", () => {
    createUser(`${BASE_URL}/api/users`, USERNAME, PASSWORD);
    sleep(1);
    authToken = loginUser(
      `${BASE_URL}/api/users/token/login`,
      USERNAME,
      PASSWORD,
    );
    sleep(1);
  });
  return authToken;
}

export function createAndLoginUserScenario() {
  const USERNAME = `${randomString(10)}@example.com`;
  const PASSWORD = "secret";
  group("Users operations", () => {
    createUser(`${BASE_URL}/api/users`, USERNAME, PASSWORD);
    sleep(1);
    loginUser(`${BASE_URL}/api/users/token/login`, USERNAME, PASSWORD);
    sleep(1);
  });
}

export function crudPizzaRatingScenario(authToken) {
  const requestConfig = () => ({
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
  let pizzaId = makePizza(`${BASE_URL}/api/pizza`, requestConfig());
  sleep(1);
  const URL = `${BASE_URL}/api/ratings`;
  group("Ratings CRUD operations", () => {
    let ratingId = createRating(URL, pizzaId, requestConfig());
    sleep(1);
    fetchRatings(URL, requestConfig());
    sleep(1);
    updateRating(URL, ratingId, 5, requestConfig());
    sleep(1);
    deleteRating(URL, ratingId, requestConfig());
    sleep(1);
  });
}
