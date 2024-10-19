import { Job, Worker, Queue, RedisOptions } from "bullmq";
import { createClient } from "redis";

// Redis connection configuration
const connection_config: RedisOptions = {
  host: "localhost",
  port: 6379,
};

// Create Redis publisher client
const publisher = createClient();

// Function to connect Redis
(async function connect_redis() {
  await publisher.connect();
})();

// BullMQ Worker for processing jobs in the CalculateSumQueue
const CalculateSumQueueWorker = new Worker(
    "CalculateSumQueue", 
    async (job: Job) => {
      console.log(`Received job: ${job.id} with data:`, job.data);
  
      let response;
      try {
        // Access the numbers array from job.data.data.numbers
        const numbers = job.data.data.numbers;
  
        // Check if the numbers are an array and process the sum
        if (Array.isArray(numbers)) {
          const sum = numbers.reduce((acc, num) => acc + num, 0); // Calculate sum of numbers
  
          response = sum; // Store the result (sum of all numbers)
  
          // Publish the result back to the Redis "job_response" channel
          await publisher.publish(
            "job_response",
            JSON.stringify({ jobId: job.id, response: `${response}` })
          );
        } else {
          throw new Error("Invalid job data: 'numbers' should be an array");
        }
      } catch (error) {
        console.error(`Error processing job ${job.id}:`, error);
  
        // Publish the error message if the job fails
        await publisher.publish(
          "job_response",
          JSON.stringify({ jobId: job.id, error: `${error}` })
        );
        throw error; // Re-throw the error for BullMQ to handle it
      }
    },
    { connection: connection_config } // Pass Redis connection config to BullMQ worker
  );
  
// Listen for job completion events
CalculateSumQueueWorker.on("completed", (job) => {
  console.log(`Job ${job.id} completed successfully.`);
});

