import { Queue, QueueOptions, JobsOptions } from "bullmq";
import { RedisOptions } from 'ioredis';

const connection_config: RedisOptions = {
  host: "localhost",
  port: 6379
}

const defaultJobOptions: JobsOptions = {
  attempts: 3, // Number of attempts to process the job
  delay:1000,
  keepLogs:1
  
}

export const CalculateSumQueue= new Queue("CalculateSumQueue", { defaultJobOptions, connection: connection_config });