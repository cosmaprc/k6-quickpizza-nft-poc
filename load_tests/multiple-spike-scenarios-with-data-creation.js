import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";
import { randomString } from "https://jslib.k6.io/k6-utils/1.2.0/index.js";
import papaparse from "https://jslib.k6.io/papaparse/5.1.1/index.js";
// This will export to HTML as filename "result.html" AND also stdout using the text summary
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { group, sleep } from "k6";
import { SharedArray } from "k6/data";

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

/*global open*/
const csvData = new SharedArray("Data creation", function () {
  return papaparse.parse(open("../data_creation/data.csv"), { header: true })
    .data;
});

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

export function crudPizzaRatingScenario() {
  const authToken = csvData[Math.floor(Math.random() * csvData.length)][""];
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
