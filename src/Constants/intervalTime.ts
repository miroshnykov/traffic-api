export enum IntervalTime {
  SEND_TO_AGGREGATOR = 20000, // 20 sec
  FAILED_LIDS_PROCESS = 3600000, // 3600000 ms ->  1h
  OFFERS_CHECK_SIZE = 10000, //  10000 ms -> 10s
  CAMPAIGN_CHECK_SIZE = 10000, //  10000 ms -> 10s
  FAILED_LIDS_DYNAMO_DB_PROCESS = 1800000, // 1800000 ms -> 30m
  CHECK_REDIS_SIZE_CAMPAIGNS = 600000, // 600000 ms -> 10m
  CHECK_REDIS_SIZE_OFFERS = 720000, // 720000 ms -> 12m
  SEND_METRICS_SYSTEM = 30000, // 30000 ms -> 30c
}
