import Influx from 'influxdb-nodejs';
import os from 'node:os';
import consola from 'consola';
import * as _ from 'lodash';
import * as dotenv from 'dotenv';
import cpu from 'cpu';

dotenv.config();
const host = process.env.GRAFANA_HOST;
const clientInfluxdb = new Influx(host);
const projectName = process.env.GRAFANA_PROJECT_NAME;
const project = (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'staging') ? `${projectName}_staging` : projectName;
const hostname = os.hostname();

// eslint-disable-next-line @typescript-eslint/naming-convention
const num_cpu = cpu.num();
enum Interval {
  INTERVAL_REQUEST = 10,
  INTERVAL_SYSTEMS = 30000,
}

interface IParam {
  code: number
  route: string
  method: string
}

consola.info(`Grafana project name:${project}, host:${host}`);
export const influxdb = (statusCode: number, route: string) => {
  const params: IParam = {
    code: statusCode,
    route,
    method: 'GET',
  };

  clientInfluxdb.write(`${project}_request`)
    .tag({
      project,
      host: hostname,
      route: params.route,
      method: params.method,
      status: _.sortedIndex([99, 199, 299, 399, 499, 599], params.code) * 100,
    })
    .field(params)
    .time(Date.now(), 'ms')
    .queue();

  if (clientInfluxdb.writeQueueLength >= Interval.INTERVAL_REQUEST) {
    // consola.success(`Send to Grafana, interval:${Interval.INTERVAL_REQUEST} `)
    clientInfluxdb.syncWrite()
      .catch((error: any) => {
        consola.error(error);
      });
  }
};

export const sendMetricsSystem = () => {
  const memoryPercentageV8 = (process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100;
  const totalmem = os.totalmem();
  const freemem = os.freemem();
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const memory_usage_perc = Number((100 - (freemem / totalmem) * 100).toFixed(2));
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const fields = {
    mem_os_usage: memory_usage_perc, // Memory usage %
    memory_percentage_v8: memoryPercentageV8, // Memory usage %
    cpu_avg_perc: 0,
  };
  // eslint-disable-next-line @typescript-eslint/no-shadow
  cpu.usage((cpu: any) => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    let load_cpu = 0;
    cpu.forEach((item: any) => {
      load_cpu += Number(item);
    });
    // @ts-ignore
    fields.cpu_avg_perc = load_cpu / num_cpu;
    // consola.success(`Send to Grafana, hostname: ${hostname} sendMetricsSystem data:${JSON.stringify(fields)}`);
    clientInfluxdb.write(`${project}_system`)
      .tag({
        project,
        host: `${hostname}`,
      })
      .field(fields)
      .time(Date.now(), 'ms')
      .then(() => {})
      .catch((error: any) => {
        consola.error(error);
      });
  });
};
