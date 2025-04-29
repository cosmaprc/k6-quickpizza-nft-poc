import { randomString } from "https://jslib.k6.io/k6-utils/1.2.0/index.js";
import { check, sleep } from "k6";
import http from "k6/http";
import filewriter from "k6/x/filewriter";

import { BASE_URL } from "./config/config.js";

export const options = {
  vus: 1,
  iterations: 1,
};

const USERNAME = `${randomString(10)}@example.com`;
const PASSWORD = "secret";

export function setup() {
  const res = http.post(
    `${BASE_URL}/api/users`,
    JSON.stringify({
      username: USERNAME,
      password: PASSWORD,
    }),
  );

  check(res, { "created user": (r) => r.status === 201 });
  sleep(1);

  const loginRes = http.post(
    `${BASE_URL}/api/users/token/login`,
    JSON.stringify({
      username: USERNAME,
      password: PASSWORD,
    }),
  );

  const authToken = loginRes.json("token");
  check(authToken, { "logged in successfully": () => authToken.length > 0 });
  sleep(1);

  return authToken;
}

export default function (authToken) {
  filewriter.createFile("./", "data.csv");
  filewriter.appendString("./", "data.csv", "" + authToken + ",");
}
