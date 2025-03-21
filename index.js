import express from "express";
import bodyParser from "body-parser";
import { exec } from "node:child_process";
// import crypto from "node:crypto";

// Load the environment variables
import * as dotenv from "dotenv";
dotenv.config();

const app = express();
const port = 3069; // Or your preferred port

// Use body-parser to handle JSON payload
app.use(bodyParser.json());

// Paths to script, change per project
const PATHS = {
  staging: process.env.SCRIPT_PATH_STAGING,
  production: process.env.SCRIPT_PATH_PRODUCTION,
  script_name: process.env.SCRIPT_NAME,
};

// Webhook route
app.post("/postreceive", (req, res) => {
  const payload = req.body;

  // Optional: Verify the GitHub webhook signature (using the secret key)
  // const secret = process.env.GITHUB_WEBHOOK_SECRET; // Store your secret in .env
  // const signature = req.headers.get("X-Hub-Signature");
  // const hash = crypto.createHmac("sha1", secret).update(payload).digest("hex");

  // if (`sha1=${hash}` !== signature) {
  // 	console.error("Invalid signature");
  // 	return new Response("Invalid signature", { status: 400 });
  // }

  // Extract the branch name from the "ref" field
  const ref = payload.ref; // e.g., "refs/heads/master"
  const branch = ref.split("/")[2]; // This will give "master" (or any branch name)

  const scriptPath = branch === "master" ? PATHS.production : PATHS.staging;
  const scriptArg = branch === "master" ? "web-production" : "web-staging";

  // Trigger deployment script
  exec(
    `cd ${scriptPath} && bash ${PATHS.script_name} ${scriptArg}`,
    (err, stdout, stderr) => {
      if (err) {
        return res.status(500).send("Error during redeployment");
      }

      res.status(200).send("Deployment triggered successfully");
    }
  );
});

app.listen(port, () => {
  console.log(`Webhook listener running on port ${port}`);
});
