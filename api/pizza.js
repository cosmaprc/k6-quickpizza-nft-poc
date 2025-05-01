import { check } from "k6";
import http from "k6/http";

import { getRndInteger } from "../utils/utils.js";

export function makePizza(URL, params) {
  let reqBody = {
    maxCaloriesPerSlice: getRndInteger(100, 1000),
    mustBeVegetarian: Math.random() < 0.5,
    excludedIngredients: ["anchovies", "bacon"],
    excludedTools: [],
    maxNumberOfToppings: getRndInteger(2, 10),
    minNumberOfToppings: 2,
  };
  const res = http.post(URL, JSON.stringify(reqBody), {
    ...params,
    ...{ tags: { name: "/api/pizza" } },
  });
  const isSuccessful = check(res, {
    "Got pizza": (r) => r.status === 200,
  });
  if (!isSuccessful) {
    throw new Error(
      `Unable to get pizza ${URL} ${res.status} ${res.status_text} ${res.body}`,
    );
  } else {
    return res.json().pizza.id;
  }
}
