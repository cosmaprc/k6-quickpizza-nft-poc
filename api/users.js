import { check } from "k6";
import http from "k6/http";

export function createUser(URL, username, password) {
  const res = http.post(
    URL,
    JSON.stringify({
      username: username,
      password: password,
    }),
  );
  const isSuccessfulCreate = check(res, {
    "Created user": (r) => r.status === 201,
  });
  if (!isSuccessfulCreate) {
    console.log(`Unable to create user ${URL} ${res.status} ${res.body}`);
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
  );
  const isSuccessfulLogin = check(res, {
    "Logged in user": (r) => r.status === 200,
    "Valid token": (r) => r.json("token").length > 0,
  });
  if (!isSuccessfulLogin) {
    console.log(`Unable to login user ${URL} ${res.status} ${res.body}`);
  }
  authToken = res.json("token");
  return authToken;
}
