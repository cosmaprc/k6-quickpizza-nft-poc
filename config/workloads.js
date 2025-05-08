
export function spikeWorkload(targetRps, totalHttpCallsPerTest, exec = null) {
  let target = Math.ceil(targetRps / totalHttpCallsPerTest)
  let workload =  {
    executor: 'ramping-arrival-rate',
    startRate: 0,
    timeUnit: '1s',
    preAllocatedVUs: 1,
    // vus are set to a lot more than the target rps, just to be sure we have enough, but a better way to tell how many are needed would be good
    maxVUs: target * 10,
    stages: [
      { target: target, duration: '1m' },
      { target: 0, duration: '1m' },
    ],
  };
  if (exec != null) {
    workload.exec = exec
  };
  return workload
};

export function testWorkload(targetRps = null, totalHttpCallsPerTest = null, exec = null) {
  let workload = {
    executor: "shared-iterations",
    iterations: 1,
    vus: 1,
  };
  if (exec != null) {
    workload.exec = exec
  };
  return workload
};
