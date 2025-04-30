# k6 Quickpizza Non-Functional tesing POC

This is a POC of performance/non-functional testing a backend API using Grafana k6.

Since https://test-api.k6.io is now deprecated and redirects to https://quickpizza.grafana.com I've used the Quickpizza API https://github.com/grafana/quickpizza . This project has a https://github.com/grafana/quickpizza/blob/main/quickpizza-openapi.yaml file that can be loaded into https://editor.swagger.io/ to get a view of how it works and even test it directly from swagger, making it easy to write test scripts for it's endpoints.

It is built using plan javascript, npm and node and uses eslint for linting, prettier for code formatting and lint-staged to run these on pre-commit, ensuring no unchecked code gets merged.

This project reuses code from the https://github.com/grafana/k6-oss-workshop project to run Grafana and Prometheus for Observability.

# Covered endponts

```{.bash }
POST /api/users             # Register a new user
POST /api/users/token/login # User login

POST /api/pizza             # Get a pizza recommendation

POST /api/ratings           # Create a new rating
GET /api/ratings            # Get all ratings by user
PUT /api/ratings/{id}       # Update a rating
DELETE /api/ratings/{id}    # Delete a rating
```

# Structure

```
k6-quickpizza-nft-poc/
├─ api/           # Models the quickpizza API endpoint using reusable k6 functions
├─ config/        # Contains k6 workload and threshold config files as well as prometheus and grafana config files
├─ data_creation/ # Contains the data creation scripts and their output files
├─ libs/          # Contains the custom k6 library that can write to filesystem
├─ load_tests/    # Contains the k6 load test scripts
├─ utils/         # Utility functions for the load test scripts
```

# Load tests

There are three files found in the ./load_tests/ direcotry, all using the same shared and reusable /api and /config functions:

- single-spike-scenario.js - Single scenario workload with sequential journey calls and no setup phase
- multiple-spike-scenarios.js - Multiple individual scenarios run together. Contains a setup phase as well for shared user authentication.
- multiple-spike-scenarios-with-data-creation.js - Same as the above but instead of a shared user authentication setup phase, it uses a CSV file created with a separate ./data_creation/data-creation.js script to load pre-created authentication tokens used in journeys that require the user to be authenticated.

# Test environments

- test - Runs a local single run functional smoke test to verify all journeys are working
- dev - Runs a Spike test on a local deployment of the Quickpizza API found at http://localhost:3333
- prod - Runs a Spike test against the live API at https://quickpizza.grafana.com/

# Start/Stop Prometheus and grafana

Courtesy of https://github.com/grafana/k6-oss-workshop

- http://localhost:3000/dashboards
- http://localhost:9090/query

```
docker compose up -d
docker compose down
```

# Run the main load test script

Main test script is /load_tests/multiple-spike-scenarios.js , using prod env, an html-report generated and exposing 95th and 99th percentile metrics to Prometheus/Grafana

```
npm test
```

# Select the load test to run

```
export "K6_PROMETHEUS_RW_TREND_STATS=p(95),p(99),min,max"

k6 run --out=experimental-prometheus-rw ./load_tests/multiple-spike-scenarios.js -e ENVIRONMENT=dev # test/dev/prod
k6 run --out=experimental-prometheus-rw ./load_tests/single-spike-scenario.js -e ENVIRONMENT=dev
```

## Run data creation to create the data.csv file with a valid token and run the load test

```
cd ./data_creation
./libs/k6 run ./data-creation.js -e ENVIRONMENT=dev
cd ../
k6 run --out=experimental-prometheus-rw ./load_tests/multiple-spike-scenarios-with-data-creation.js -e ENVIRONMENT=dev
```

# Building a k6 version that can write to the filesystem for data creation

## Install golang and set up the PATH so it can run xk6

- https://developer.fedoraproject.org/tech/languages/go/go-installation.html
- https://community.grafana.com/t/unable-to-locate-xk6-after-installing-it/99016

## Install xk6

- https://grafana.com/docs/k6/latest/extensions/build-k6-binary-using-go/

```
go install go.k6.io/xk6/cmd/xk6@latest
```

## Build a k6 version that has the xk6-filewriter go module to write to file

- https://github.com/Dataport/xk6-filewriter

```
xk6 build --with github.com/Dataport/xk6-filewriter
```

## Run data creation to create the data.csv file with a valid token

```
cd ./data_creation
./libs/k6 run ./data-creation.js -e ENVIRONMENT=dev
```

# Quickpizza performance analysis

There are 7 calls, depending on the script run, they are all in the same scenario or in multiple. Each call has a sleep(1) at the end for more predictible RPS.

Spike test shape:

```
  executor: "ramping-vus",
  startVUs: 0,
  stages: [
    { duration: "1m", target: TARGET_RPS_OR_VUS * NUMBER_OF_CALLS_PER_SCENARIO_ITERATION },
    { duration: "1m", target: 0 },
  ],
  gracefulRampDown: "0s",
```

Set some potentially sensible default limits:

```
50% - 50ms
95% - 300ms
99% - 1s
```

Add some extra graphs to the k6 Prometheus dashboard:
Latency:

- Reponse times per percentile we monitor
- Response times per percentile and per endpoint url we test
  Errors
- Success/Failed Requests - Request distribution by success and failure
- Errors - Errors seen, grouped by url, method and status code
- Request Failure Rate - Rate of failed requests by url and method
- Error Spike - Request error spikes by url and method

Fresh start the local quickpizza setup using docker compose up/down before each test run to avoid issues.

Take a baseline spike scenario targeting 1 RPS per endpoint, 7 endpoints, so 7 RPS overall

From the start we can see that POST /api/pizza is unacceptably slow even at this low RPS :

```
{url:/api/pizza,method:POST}
✗ 'p(50)<50' p(50)=80.72ms
✗ 'p(95)<300' p(95)=571.76ms
✓ 'p(99)<1000' p(99)=591.75ms
```

3 - Restart quickpizza app and rerun test at 10x Rps, so 10 RPS per endpoint or 70 RPS overall

```
 ✗ { url:/api/pizza,method:POST }...............: min=3.75ms   avg=192.85ms med=88.54ms  max=691.03ms p(50)=88.54ms  p(95)=592.67ms p(99)=639.97ms
```

10x 700 overall, so 70 per endpoint

more than 10% of requests failed

```
✗ http_req_duration..............................: min=271.91µs avg=388.22ms med=84.75ms  max=11.99s   p(50)=84.75ms  p(95)=1.69s   p(99)=3.43s
       { expected_response:true }...................: min=481.79µs avg=386.1ms  med=92.33ms  max=11.99s   p(50)=92.33ms  p(95)=1.67s   p(99)=3.56s
     ✗ { url:/api/pizza,method:POST }...............: min=3.45ms   avg=693.06ms med=571.28ms max=2.77s    p(50)=571.28ms p(95)=1.69s   p(99)=1.97s
     ✗ { url:/api/ratings,method:POST }.............: min=428.15µs avg=350.22ms med=46.41ms  max=10.54s   p(50)=46.41ms  p(95)=1.79s   p(99)=3.66s
     ✗ { url:/api/ratings/{id} ,method:DELETE }.....: min=286.98µs avg=424.68ms med=9.74ms   max=11.99s   p(50)=9.74ms   p(95)=2.15s   p(99)=4.43s
     ✗ { url:/api/ratings/{id},method:PUT }.........: min=271.91µs avg=395.89ms med=8.31ms   max=8.78s    p(50)=8.31ms   p(95)=2.05s   p(99)=4.02s
     ✗ { url:/api/users/token/login,method:POST }...: min=44.76ms  avg=91.49ms  med=69.17ms  max=429.51ms p(50)=69.17ms  p(95)=206.5ms p(99)=283.87ms
   ✗ http_req_failed................................: 10.49% ✓ 3182       ✗ 27142
```

350 max VUs so targeting 350 max RPS

```
 ✓ http_req_duration..............................: min=476.98µs avg=52.52ms  med=12.57ms  max=860.8ms  p(50)=12.57ms  p(95)=230.3ms  p(99)=602.63ms
       { expected_response:true }...................: min=476.98µs avg=52.52ms  med=12.57ms  max=860.8ms  p(50)=12.57ms  p(95)=230.3ms  p(99)=602.63ms
     ✗ { url:/api/pizza,method:POST }...............: min=4.74ms   avg=226.51ms med=113.57ms max=860.8ms  p(50)=113.57ms p(95)=625.82ms p(99)=709.79ms
     ✓ { url:/api/ratings,method:POST }.............: min=653.05µs avg=5.21ms   med=1.18ms   max=82.58ms  p(50)=1.18ms   p(95)=24.44ms  p(99)=46.96ms
     ✓ { url:/api/ratings/{id} ,method:DELETE }.....: min=476.98µs avg=5.58ms   med=1.23ms   max=103.85ms p(50)=1.23ms   p(95)=26.01ms  p(99)=52.8ms
     ✓ { url:/api/ratings/{id},method:PUT }.........: min=511.72µs avg=5.16ms   med=1.11ms   max=83.28ms  p(50)=1.11ms   p(95)=23.43ms  p(99)=46.38ms
     ✗ { url:/api/users/token/login,method:POST }...: min=44.4ms   avg=54.2ms   med=52.54ms  max=115.32ms p(50)=52.54ms  p(95)=67.09ms  p(99)=83.89ms
   ✓ http_req_failed................................: 0.00%   ✓ 0          ✗ 20095
```

350 max VUs targeting 350 RPS

```
  ✗ http_req_duration..............................: min=273.26µs avg=213.04ms med=60.73ms  max=5.11s    p(50)=60.73ms  p(95)=991.49ms p(99)=1.74s
       { expected_response:true }...................: min=516.59µs avg=208.54ms med=61.36ms  max=5.11s    p(50)=61.36ms  p(95)=938.54ms p(99)=1.71s
     ✗ { url:/api/pizza,method:POST }...............: min=3.68ms   avg=473.33ms med=402.53ms max=2.11s    p(50)=402.53ms p(95)=1.29s    p(99)=1.69s
     ✗ { url:/api/ratings,method:POST }.............: min=548.61µs avg=172.37ms med=15.45ms  max=3.33s    p(50)=15.45ms  p(95)=921.42ms p(99)=1.77s
     ✗ { url:/api/ratings/{id} ,method:DELETE }.....: min=273.26µs avg=216.88ms med=12.32ms  max=3.81s    p(50)=12.32ms  p(95)=1.16s    p(99)=2.09s
     ✗ { url:/api/ratings/{id},method:PUT }.........: min=305.07µs avg=202.36ms med=10.95ms  max=4.14s    p(50)=10.95ms  p(95)=1.05s    p(99)=1.85s
     ✗ { url:/api/users/token/login,method:POST }...: min=44.17ms  avg=78.03ms  med=61.53ms  max=412.01ms p(50)=61.53ms  p(95)=172.56ms p(99)=234.28ms
   ✗ http_req_failed................................: 2.55%  ✓ 666        ✗ 25439
```

441 max VUs targeting 441 RPS

```
✗ http_req_duration..............................: min=367.57µs avg=104.35ms med=50.94ms  max=1.97s    p(50)=50.94ms  p(95)=510.87ms p(99)=851.71ms
    { expected_response:true }...................: min=494.79µs avg=103.92ms med=50.96ms  max=1.94s    p(50)=50.96ms  p(95)=509.74ms p(99)=844.7ms
  ✗ { url:/api/pizza,method:POST }...............: min=4.97ms   avg=323.92ms med=240.65ms max=1.97s    p(50)=240.65ms p(95)=825.82ms p(99)=1.13s
  ✓ { url:/api/ratings,method:POST }.............: min=507.51µs avg=52.72ms  med=4.47ms   max=1.82s    p(50)=4.47ms   p(95)=248.18ms p(99)=632.74ms
  ✗ { url:/api/ratings/{id} ,method:DELETE }.....: min=374.32µs avg=69.58ms  med=6.09ms   max=1.94s    p(50)=6.09ms   p(95)=341.18ms p(99)=747.63ms
  ✗ { url:/api/ratings/{id},method:PUT }.........: min=367.57µs avg=64.56ms  med=5.51ms   max=1.66s    p(50)=5.51ms   p(95)=320.16ms p(99)=748.31ms
  ✗ { url:/api/users/token/login,method:POST }...: min=44.46ms  avg=68.43ms  med=57.13ms  max=242.63ms p(50)=57.13ms  p(95)=128.69ms p(99)=177.93ms
✓ http_req_failed................................: 0.14%  ✓ 36         ✗ 24080
```

# TODOS

- Secrets like the user password used to atuehnticate with the API can be saved using gitcrypt locally or in a k8s environment as secret files mounted in the test pods or even pulled from Vault.
- The scenarios all run either a local smoke test in the test env or a simplistic spike test that does not control the rate of requests per second sent to the api very well. An improvement would be to use another scenario type like the constant or ramping arrival rate ones to better control RPS per endpoint under test. Also having a stress test coupled with a longer soak test would likely be the way to go.
- The default quickpizza grafana dashboard does not show the per endpoint/transaction RPS rates in percentiles over time, so we could improve on this to get a better view of how the RPS changes per endpoint during the test run.
- The data creation example uses CSV files but we could switch to JSON based files using https://msgpack.org/index.html for "efficient binary serialization"
