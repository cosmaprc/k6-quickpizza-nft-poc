import { randomString } from "https://jslib.k6.io/k6-utils/1.2.0/index.js";
import { group } from "k6";

import { makePizza } from "./api/pizza.js";
import {
  createRating,
  deleteRating,
  fetchRatings,
  updateRating,
} from "./api/ratings.js";
import { createUser, loginUser } from "./api/users.js";
import { BASE_URL, THRESHOLDS, WORKLOAD } from "./config/config.js";

export const options = {
  scenarios: {
    my_scenario: WORKLOAD,
  },
  thresholds: THRESHOLDS,
};

export default function () {
  const USERNAME = `${randomString(12)}@example.com`;
  const PASSWORD = "secret";

  const requestConfigWithTag = (tag) => ({
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
    tags: Object.assign(
      {},
      {
        name: "Pizza Rating Scenario",
      },
      tag,
    ),
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
    pizzaId = makePizza(
      `${BASE_URL}/api/pizza`,
      requestConfigWithTag({ name: "Make Pizza" }),
    );
  });

  const URL = `${BASE_URL}/api/ratings`;

  group("Ratings operations", () => {
    let ratingId = createRating(
      URL,
      pizzaId,
      requestConfigWithTag({ name: "Create Rating" }),
    );
    fetchRatings(URL, requestConfigWithTag({ name: "Fetch Ratings" }));
    updateRating(
      URL,
      ratingId,
      5,
      requestConfigWithTag({ name: "Update Rating" }),
    );
    deleteRating(URL, requestConfigWithTag({ name: "Delete Rating" }));
  });
}
