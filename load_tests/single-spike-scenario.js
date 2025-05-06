import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";
import { randomString } from "https://jslib.k6.io/k6-utils/1.2.0/index.js";
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { group } from "k6";

import { makePizza } from "../api/pizza.js";
import {
  createRating,
  deleteRating,
  fetchRatings,
  updateRating,
} from "../api/ratings.js";
import { createUser, loginUser } from "../api/users.js";
import { BASE_URL, THRESHOLDS, WORKLOAD } from "../config/config.js";

export const options = {
  scenarios: {
    my_scenario: WORKLOAD,
  },
  thresholds: THRESHOLDS,
};

export function handleSummary(data) {
  return {
    "result.html": htmlReport(data),
    stdout: textSummary(data, { indent: " ", enableColors: true }),
  };
}

export default function () {
  const USERNAME = `${randomString(8)}hb1@example.com`;
  const PASSWORD = "secret";

  const requestConfig = () => ({
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  let authToken = null; // This will be set after the user is created and logged in
  group("Users operations", () => {
    createUser(`${BASE_URL}/api/users`, USERNAME, PASSWORD);
    authToken = loginUser(
      `${BASE_URL}/api/users/token/login`,
      USERNAME,
      PASSWORD,
    );
  });

  let pizzaId = null; // This will be set after the pizza is created
  group("Pizza operations", () => {
    pizzaId = makePizza(`${BASE_URL}/api/pizza`, requestConfig());
  });

  const URL = `${BASE_URL}/api/ratings`;

  group("Ratings operations", () => {
    let ratingId = createRating(URL, pizzaId, requestConfig());
    fetchRatings(URL, requestConfig());
    updateRating(URL, ratingId, 5, requestConfig());
    deleteRating(URL, ratingId, requestConfig());
  });
}
