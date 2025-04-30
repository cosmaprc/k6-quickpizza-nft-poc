# k6 Quickpizza Non-Functional tesing POC

# Install golang and set up the PATH so it can run xk6

https://developer.fedoraproject.org/tech/languages/go/go-installation.html
https://community.grafana.com/t/unable-to-locate-xk6-after-installing-it/99016

# Install xk6

https://grafana.com/docs/k6/latest/extensions/build-k6-binary-using-go/
`go install go.k6.io/xk6/cmd/xk6@latest`

# Build a k6 version that has the xk6-filewriter go module to write to file

https://github.com/Dataport/xk6-filewriter
`xk6 build --with github.com/Dataport/xk6-filewriter`

# Run loadtest-write.js to create the data.csv file witha valid token

https://test-api.k6.io is deprecated and now redirects to https://quickpizza.grafana.com using a `location https://quickpizza.grafana.com` header so using Quickpizza API has a https://github.com/grafana/quickpizza/blob/main/quickpizza-openapi.yaml file taht can be loaded into https://editor.swagger.io/

export "K6_PROMETHEUS_RW_TREND_STATS=p(95),p(99),min,max"
k6 run --out=experimental-prometheus-rw multiple-spike-scenarios.js -e ENVIRONMENT=dev

docker compose down
docker compose up -d
