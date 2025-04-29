import { check } from "k6";
import http from "k6/http";

import { getRndInteger } from "../utils/utils.js";

export function createRating(URL, pizzaId, params) {
  const payload = {
    stars: getRndInteger(1, 5),
    pizza_id: pizzaId,
  };
  const res = http.post(URL, JSON.stringify(payload), params);
  const isSuccessful = check(res, {
    "Created rating": (r) => r.status === 201,
  });
  if (isSuccessful) {
    return res.json("id");
  } else {
    console.log(`Unable to create rating ${URL} ${res.status} ${res.body}`);
  }
}

export function fetchRatings(URL, params) {
  const res = http.get(URL, params);
  const isSuccessful = check(res, {
    "Fetched ratings": (r) => r.status === 200,
    "Fetched ratings is a list": (r) => r.json().ratings.length > 0,
  });
  if (!isSuccessful) {
    console.log(`Unable to fetch the ratings ${URL} ${res.status} ${res.body}`);
  }
}

export function updateRating(URL, ratingId, stars, params) {
  URL = `${URL}/${ratingId}`;
  const payload = { stars: stars };
  const res = http.put(URL, JSON.stringify(payload), params);
  const isSuccessful = check(res, {
    "Updated rating": () => res.status === 200,
    "Updated rating has expected number of stars": () =>
      res.json("stars") === stars,
  });
  if (!isSuccessful) {
    console.log(`Unable to update the rating ${URL} ${res.status} ${res.body}`);
  }
}

export function deleteRating(URL, params) {
  const res = http.del(URL, null, params);
  const isSuccessful = check(res, {
    "Deleted rating": (r) => r.status === 204,
  });
  if (!isSuccessful) {
    console.log(`Rating was not deleted ${URL} ${res.status} ${res.body}`);
  }
}
