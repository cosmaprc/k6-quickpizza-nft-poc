import { check, sleep } from "k6";
import http from "k6/http";

import { getRndInteger } from "../utils/utils.js";

export function createRating(URL, pizzaId, params) {
  const payload = {
    stars: getRndInteger(1, 5),
    pizza_id: pizzaId,
  };
  const res = http.post(URL, JSON.stringify(payload), {
    ...params,
    ...{ tags: { name: "/api/ratings" } },
  });
  const isSuccessful = check(res, {
    "Created rating": (r) => r.status === 201,
  });
  if (isSuccessful) {
    return res.json("id");
  } else {
    throw new Error(
      `Unable to create rating ${URL} ${res.status} ${res.status_text} ${res.body}`,
    );
  }
}

export function fetchRatings(URL, params) {
  const res = http.get(URL, {
    ...params,
    ...{ tags: { name: "/api/ratings" } },
  });
  const isSuccessful = check(res, {
    "Fetched ratings": (r) => r.status === 200,
  });
  if (!isSuccessful) {
    throw new Error(
      `Unable to fetch the ratings ${URL} ${res.status} ${res.status_text} ${res.body}`,
    );
  }
}

export function updateRating(URL, ratingId, stars, params) {
  URL = `${URL}/${ratingId}`;
  const payload = { stars: stars };
  const res = http.put(URL, JSON.stringify(payload), {
    ...params,
    ...{ tags: { name: "/api/ratings/{id}" } },
  });
  const isSuccessful = check(res, {
    "Updated rating": (r) => r.status === 200,
  });
  if (!isSuccessful) {
    throw new Error(
      `Unable to update the rating ${URL} ${res.status} ${res.status_text} ${res.body}`,
    );
  }
}

export function deleteRating(URL, ratingId, params) {
  URL = `${URL}/${ratingId}`;
  const res = http.del(URL, null, {
    ...params,
    ...{ tags: { name: "/api/ratings/{id}" } },
  });
  const isSuccessful = check(res, {
    "Deleted rating": (r) => r.status === 204,
  });
  if (!isSuccessful) {
    throw new Error(
      `Rating was not deleted ${URL} ${res.status} ${res.status_text} ${res.body}`,
    );
  }
}
