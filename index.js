import express from "express";
import bodyParser from "body-parser";
import { exec } from "node:child_process";

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
};

// Webhook route
app.post("/postreceive", (req, res) => {
	const payload = req.body;

	// Optional: Verify the GitHub webhook signature (using the secret key)
	// Add your logic here to verify the webhook's authenticity

	console.log("Received webhook: ");
	console.log(payload);

	// Trigger deployment script (e.g., pulling the latest changes)
	exec(`bash ${PATHS.staging}`, (err, stdout, stderr) => {
		if (err) {
			return res.status(500).send("Error during redeployment");
		}

		res.status(200).send("Deployment triggered successfully");
	});
});

app.listen(port, () => {
	console.log(`Webhook listener running on port ${port}`);
});
