import express, { Request, Response } from "express";
import {  CalculateSumQueue } from "./queue";
import { createClient } from "redis";
import { Job } from "bullmq";

const client = createClient();
//Connecting the client
(async function connectRedisClient() {
  await client.connect();
})();

const app = express();
const PORT = 8080;

// Middleware to parse JSON bodies
app.use(express.json());





app.get("/calculateSum", async (req: Request, res: Response) => {
    try {
        const data=req.body;
        const job = await CalculateSumQueue.add("CalculateSumQueue", {data}, { removeOnComplete: true });
        console.log("Job ID:", job.id);

        const unsubscribe = await client.subscribe("job_response", (message) => {
            const response = JSON.parse(message);
            console.log("Response from publisher:", response);
      
            if (response.jobId === job.id) {
              if (response.error) {
                throw new Error(response.error); // Throw error for catch block
              } else {
                console.log(`Job ${job.id} completed successfully with result: ${JSON.stringify(response)}`);
                res.status(200).send({ result: response }); // Send only the result
               
              }
            } else {
              console.warn(`Received response for unknown job ID: ${response.jobId}`);
            }
          });
    } catch (error) {
        console.error("Error adding job to queue:", error);
        res.status(500).send({ error: "An internal error occurred while submitting the job." });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});