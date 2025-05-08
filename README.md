# k6 Quickpizza Non-Functional tesing POC

This is a POC of performance/non-functional testing a backend API using Grafana k6.

Since [test-api.k6.io](https://test-api.k6.io) is now deprecated and redirects to the [Quickpizza API](https://github.com/grafana/quickpizza), I've used that for this project. Quickpizza has an [openapi.yaml](https://github.com/grafana/quickpizza/blob/main/quickpizza-openapi.yaml) file that can be loaded into [Swagger editor](https://editor.swagger.io/) to get a view of how it works and even test it directly from swagger, making it easy to write test scripts for it's endpoints.

This POC project is built using plain javascript, npm and node and uses eslint for linting, prettier for code formatting and lint-staged to run these on pre-commit, ensuring no unchecked code gets merged. It also reuses code from the [k6-oss-workshop](https://github.com/grafana/k6-oss-workshop) project to run Grafana and Prometheus for Observability.

### Improvements over previous version
Based on the feedback from Maciej on https://grafana.com/docs/k6/latest/using-k6/scenarios/concepts/open-vs-closed/ I was able to replace my ramping-vus sleep based implementation with a more elegant ramping-arrival-rate executor, removing all sleeps and simplifying the code while adding more test opitons for each test file. Turns our my usage of sleep and rps values was what was causing my multi-scenario to break early in prod and with this implementation both the signle and multi scenario files reach the same 74 RPS in live prod and 400 RPS on my local machine after which point they start getting errors, likely because the app is somehow overloaded.

## Covered endponts

```{.bash }
POST /api/users             # Register a new user
POST /api/users/token/login # User login

POST /api/pizza             # Get a pizza recommendation

POST /api/ratings           # Create a new rating
GET /api/ratings            # Get all ratings by user
PUT /api/ratings/{id}       # Update a rating
DELETE /api/ratings/{id}    # Delete a rating
```

## Structure

```
k6-quickpizza-nft-poc/
├─ api/           # Models the quickpizza API endpoint using reusable k6 functions
├─ config/        # Contains k6 workload and threshold config files as well as prometheus and grafana config files
├─ data_creation/ # Contains the data creation scripts and their output files
├─ libs/          # Contains the custom k6 library that can write to filesystem
├─ load_tests/    # Contains the k6 load test scripts
├─ reports/       # Report files
├─ utils/         # Utility functions for the load test scripts
```

## Load tests

There are three files found in the [load_tests](./load_tests) direcotry, all using the same shared and reusable /api and /config functions:

- [single-spike-scenario.js](./load_tests/single-spike-scenario.js) - Single scenario workload with sequential journey calls and no setup phase
- [multiple-spike-scenarios.js](./load_tests/multiple-spike-scenarios.js) - Multiple individual scenarios run together. Contains a setup phase as well for shared user authentication.
- [multiple-spike-scenarios-with-data-creation.js](./load_tests/multiple-spike-scenarios-with-data-creation.js) - Same as the above but instead of a shared user authentication setup phase, it uses a CSV file created with a separate [data-creation.js](./data_creation/data-creation.js) script to load pre-created authentication tokens used in journeys that require the user to be authenticated.

## Test environments

- `test` - Runs a local single run functional smoke test to verify all journeys are working
- `dev` - Runs a Spike test on a local deployment of the Quickpizza API found at [localhost:3333](http://localhost:3333)
- `prod` - Runs a Spike test against the live API at [quickpizza.grafana.com](https://quickpizza.grafana.com/)

## Start/Stop Prometheus and grafana

Courtesy of Grafana [k6-oss-workshop](https://github.com/grafana/k6-oss-workshop)

- [localhost:3000/dashboards](http://localhost:3000/dashboards)
- [localhost:9090/query](http://localhost:9090/query)

```bash
# Start docker, grafana and a local quickpizza app
docker compose up -d

# Stop
docker compose down
```

## Run the main load test script

Main test scripts are [multiple-spike-scenarios.js](./load_tests/multiple-spike-scenarios.js) for test and dev and [single-spike-scenario.js](./load_tests/single-spike-scenario.js) for prod env due to an issue with the multiple spike scenario script that seems to get worse when hitting the live API as opposed to the local one. The run will generate an html-report.html and a result.html file, besides the text summary as well as send metrics to Prometheus/Grafana.

***Note, to run npm commands you will need to install node and npm which you can do with the node version manager [nvm](https://github.com/nvm-sh/nvm) , alternatively, the scripts can be run directly using the k6 command which will also need to be installed.***

In the [package.json](./package.json) you will find multiple run commands:
 `npm run test` - Runs a local single run functional smoke test to verify all journeys are working using [single-spike-scenario.js](./load_tests/single-spike-scenario.js)
- `npm run test-multi` - Runs a local single run functional smoke test to verify all journeys are working using [multiple-spike-scenarios.js](./load_tests/multiple-spike-scenarios.js)
- `npm run test-multi-data` - Runs a local single run functional smoke test to verify all journeys are working using [multiple-spike-scenarios-with-data-creation.js](./load_tests/multiple-spike-scenarios-with-data-creation.js) (Requires data creation be run first for this env)
---
- `npm run dev` - Runs a Spike test on a local deployment of the Quickpizza API found at [localhost:3333](http://localhost:3333) using [single-spike-scenario.js](./load_tests/single-spike-scenario.js)
- `npm run dev-multi` - Runs a Spike test on a local deployment of the Quickpizza API found at [localhost:3333](http://localhost:3333) using [multiple-spike-scenarios.js](./load_tests/multiple-spike-scenarios.js)
- `npm run dev-multi-data` - Runs a Spike test on a local deployment of the Quickpizza API found at [localhost:3333](http://localhost:3333) using [multiple-spike-scenarios-with-data-creation.js](./load_tests/multiple-spike-scenarios-with-data-creation.js) (Requires data creation be run first for this env)
---
- `npm run prod-single` - Runs a Spike test against the live API at [quickpizza.grafana.com](https://quickpizza.grafana.com/) using [single-spike-scenario.js](./load_tests/single-spike-scenario.js)
- `npm run prod-multi` - Runs a Spike test against the live API at [quickpizza.grafana.com](https://quickpizza.grafana.com/) using [multiple-spike-scenarios.js](./load_tests/multiple-spike-scenarios.js)


## Or run without npm, using k6 directly

```bash
K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=html-report.html K6_PROMETHEUS_RW_TREND_STATS=p\(90\),p\(95\),min,max k6 run --out=experimental-prometheus-rw --summary-trend-stats min,avg,med,max,p\(90\),p\(95\) ./load_tests/multiple-spike-scenarios.js -e ENVIRONMENT=prod # test/dev/prod
```
```bash
K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=html-report.html K6_PROMETHEUS_RW_TREND_STATS=p\(90\),p\(95\),min,max k6 run --out=experimental-prometheus-rw --summary-trend-stats min,avg,med,max,p\(90\),p\(95\) ./load_tests/single-spike-scenario.js -e ENVIRONMENT=prod # test/dev/prod
```

## Run data creation to create the data.csv file with a valid token and run the load test

```bash
cd ./data_creation
../libs/k6 run ./data-creation.js -e ENVIRONMENT=dev
cd ../
K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=html-report.html K6_PROMETHEUS_RW_TREND_STATS=p\(90\),p\(95\),min,max k6 run --out=experimental-prometheus-rw --summary-trend-stats min,avg,med,max,p\(90\),p\(95\) ./load_tests/multiple-spike-scenarios-with-data-creation.js -e ENVIRONMENT=dev # test/dev
```

## (Optional) Building a k6 version that can write to the filesystem for data creation

***This is optional and only if you want to run the [multiple-spike-scenarios-with-data-creation.js](./load_tests/multiple-spike-scenarios-with-data-creation.js) script which needs the [data-creation.js](./data_creation/data-creation.js) script to be run first, which in turn needs a k6 version that can write to the filesystem***

### Install golang and set up the PATH so it can run xk6

- [go-installation.html](https://developer.fedoraproject.org/tech/languages/go/go-installation.html)
- [unable-to-locate-xk6-after-installing-it](https://community.grafana.com/t/unable-to-locate-xk6-after-installing-it/99016)

### Install xk6

- [build-k6-binary-using-go](https://grafana.com/docs/k6/latest/extensions/build-k6-binary-using-go/)

```bash
go install go.k6.io/xk6/cmd/xk6@latest
```

### Build a k6 version that has the xk6-filewriter go module to write to file

- [xk6-filewriter](https://github.com/Dataport/xk6-filewriter)

```bash
xk6 build --with github.com/Dataport/xk6-filewriter
```

### Run data creation to create the data.csv file with a valid token

```bash
cd ./data_creation
../libs/k6 run ./data-creation.js -e ENVIRONMENT=dev
```

