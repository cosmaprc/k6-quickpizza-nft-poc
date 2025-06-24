import { check, sleep } from "k6";
import http from "k6/http";

export function createUser(URL, username, password) {
  const res = http.post(
    URL,
    JSON.stringify({
      username: username,
      password: password,
    }),
    {
      tags: { name: "/api/users" },
    },
  );
  const isSuccessfulCreate = check(res, {
    "Created user": (r) => r.status === 201,
  });
  if (!isSuccessfulCreate) {
    throw new Error(
      `Unable to create user ${URL} ${res.status} ${res.status_text} ${res.body}`,
    );
  }
}

export function loginUser(URL, username, password) {
  let authToken = null;
  const res = http.post(
    URL,
    JSON.stringify({
      username: username,
      password: password,
    }),
    {
      tags: { name: "/api/users/token/login" },
    },
  );
  const isSuccessfulLogin = check(res, {
    "Logged in user": (r) => r.status === 200,
  });
  if (!isSuccessfulLogin) {
    throw new Error(
      `Unable to login user ${URL} ${res.status} ${res.status_text} ${res.body}`,
    );
  }
  authToken = res.json("token");
  return authToken;
}
