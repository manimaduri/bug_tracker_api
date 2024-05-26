import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { initDB } from "./models";
import router from "./routers";
import { errorResponse } from "./utils/responseHandler";

const app = express();
const port = process.env.PORT ?? 3000;

// Use cors and bodyParser middleware
app.use(cors());
app.use(bodyParser.json());

// Use routers
app.use("/", router);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
 errorResponse(res, err, err.message ?? 'Something broke!', 500);
});

async function startApp() {
  try {
    // Initialize the database
    await initDB();

    // Start your server
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start application:", error);
    process.exit(1);
  }
}

startApp();
