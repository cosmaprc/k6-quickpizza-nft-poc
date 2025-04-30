# k6 Quickpizza Non-Functional tesing POC

This is a POC of performance/non-functional testing a backend API using Grafana k6.

Since https://test-api.k6.io is now deprecated and redirects to https://quickpizza.grafana.com I've used the Quickpizza API https://github.com/grafana/quickpizza . This project has a https://github.com/grafana/quickpizza/blob/main/quickpizza-openapi.yaml file that can be loaded into https://editor.swagger.io/ to get a view of how it works and even test it directly from swagger, making it easy to write test scripts for it's endpoints.

It is built using plan javascript, npm and node and uses eslint for linting, prettier for code formatting and lint-staged to run these on pre-commit, ensuring no unchecked code gets merged.

This project reuses code from the https://github.com/grafana/k6-oss-workshop project to run Grafana and Prometheus for Observability.

# Covered endponts

```
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

# TODOS

- Secrets like the user password used to atuehnticate with the API can be saved using gitcrypt locally or in a k8s environment as secret files mounted in the test pods or even pulled from Vault.
- The scenarios all run either a local smoke test in the test env or a simplistic spike test that does not control the rate of requests per second sent to the api very well. An improvement would be to use another scenario type like the constant or ramping arrival rate ones to better control RPS per endpoint under test. Also having a stress test coupled with a longer soak test would likely be the way to go.
- The default quickpizza grafana dashboard does not show the per endpoint/transaction RPS rates in percentiles over time, so we could improve on this to get a better view of how the RPS changes per endpoint during the test run.
- The data creation example uses CSV files but we could switch to JSON based files using https://msgpack.org/index.html for "efficient binary serialization"
