import { randomString } from "https://jslib.k6.io/k6-utils/1.2.0/index.js";
import { group, sleep } from "k6";

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

export default function () {
  const USERNAME = `${randomString(12)}@example.com`;
  const PASSWORD = "secret";

  const requestConfig = () => ({
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  let authToken = null; // This will be set after the user is created and logged in
  group("Users operations", () => {
    createUser(`${BASE_URL}/api/users`, USERNAME, PASSWORD);
    sleep(1);
    authToken = loginUser(
      `${BASE_URL}/api/users/token/login`,
      USERNAME,
      PASSWORD,
    );
    sleep(1);
  });

  let pizzaId = null; // This will be set after the pizza is created
  group("Pizza operations", () => {
    pizzaId = makePizza(`${BASE_URL}/api/pizza`, requestConfig());
    sleep(1);
  });

  const URL = `${BASE_URL}/api/ratings`;

  group("Ratings operations", () => {
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
