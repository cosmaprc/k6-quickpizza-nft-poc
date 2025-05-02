import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";
import { randomString } from "https://jslib.k6.io/k6-utils/1.2.0/index.js";
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { group } from "k6";
import http from "k6/http";

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
  let username = `${randomString(10)}1@example.com`;
  let password = "secret";
  let authToken = null; // This will be set after the user is created and logged in
  group("Users setup operations", () => {
    createUser(`${BASE_URL}/api/users`, username, password);
    authToken = loginUser(
      `${BASE_URL}/api/users/token/login`,
      username,
      password,
    );
  });
  // Subsequent requests need the cookies from the login request
  const jar = http.cookieJar();
  let cookies = jar.cookiesForURL(`${BASE_URL}/api/users/token/login`);
  return {
    authToken: authToken,
    cookies: cookies,
  };
}

export function createAndLoginUserScenario() {
  let username = `${randomString(10)}2@example.com`;
  let password = "secret";
  group("Users operations", () => {
    createUser(`${BASE_URL}/api/users`, username, password);
    loginUser(`${BASE_URL}/api/users/token/login`, username, password);
  });
}

export function crudPizzaRatingScenario(setupData) {
  let requestConfig = () => ({
    headers: {
      Authorization: `Bearer ${setupData.authToken}`,
    },
  });
  let pizzaId = null; // This will be set after the pizza is created
  group("Pizza operations", () => {
    // The first call in the chain needs cookies from the setup function
    const jar = http.cookieJar();
    jar.set(`${BASE_URL}/api/pizza`, "AWSALB", setupData.cookies.AWSALB);
    jar.set(
      `${BASE_URL}/api/pizza`,
      "AWSALBCORS",
      setupData.cookies.AWSALBCORS,
    );
    pizzaId = makePizza(`${BASE_URL}/api/pizza`, requestConfig());
  });
  let URL = `${BASE_URL}/api/ratings`;
  group("Ratings CRUD operations", () => {
    let ratingId = createRating(URL, pizzaId, requestConfig());
    fetchRatings(URL, requestConfig());
    updateRating(URL, ratingId, 5, requestConfig());
    deleteRating(URL, ratingId, requestConfig());
  });
}
