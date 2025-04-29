import { randomString } from "https://jslib.k6.io/k6-utils/1.2.0/index.js";
import papaparse from "https://jslib.k6.io/papaparse/5.1.1/index.js";
import { group } from "k6";
import { SharedArray } from "k6/data";

import { makePizza } from "./api/pizza.js";
import {
  createRating,
  deleteRating,
  fetchRatings,
  updateRating,
} from "./api/ratings.js";
import { createUser, loginUser } from "./api/users.js";
import {
  BASE_URL,
  CREATE_USER_WORKLOAD,
  CRUD_PIZZA_RATING_WORKLOAD,
  LOGIN_USER_WORKLOAD,
  THRESHOLDS,
} from "./config/config.js";

/*global open*/
const csvData = new SharedArray("Data creation", function () {
  return papaparse.parse(open("./data.csv"), { header: true }).data;
});

export const options = {
  scenarios: {
    createUserScenario: CREATE_USER_WORKLOAD,
    loginUserScenario: LOGIN_USER_WORKLOAD,
    crudPizzaRatingScenario: CRUD_PIZZA_RATING_WORKLOAD,
  },
  thresholds: THRESHOLDS,
};

console.log("BASE_URL", BASE_URL);
console.log("CREATE_USER_WORKLOAD", CREATE_USER_WORKLOAD);

export function createUserScenario() {
  const USERNAME = `${randomString(10)}@example.com`;
  const PASSWORD = "secret";
  createUser(`${BASE_URL}/api/users`, USERNAME, PASSWORD);
}

export function loginUserScenario() {
  const USERNAME = `${randomString(10)}@example.com`;
  const PASSWORD = "secret";
  group("Users operations", () => {
    createUser(`${BASE_URL}/api/users`, USERNAME, PASSWORD);
    loginUser(`${BASE_URL}/api/users/token/login`, USERNAME, PASSWORD);
  });
}

export function crudRatingScenario() {
  const authToken = csvData[Math.floor(Math.random() * csvData.length)][""];
  const requestConfig = () => ({
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
  let pizzaId = makePizza(`${BASE_URL}/api/pizza`, requestConfig());
  const URL = `${BASE_URL}/api/ratings`;
  group("Ratings CRUD operations", () => {
    let ratingId = createRating(URL, pizzaId, requestConfig());
    fetchRatings(URL, requestConfig());
    updateRating(URL, ratingId, 5, requestConfig());
    deleteRating(URL, requestConfig());
  });
}
