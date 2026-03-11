import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { continuSketchError, ContinuSketchError } from "./error.js";
import expressWs from "express-ws";
import { setupRoutes } from "./routes/index.js";

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();
const wsApp = expressWs(app);

app.use(express.json());

const router = setupRoutes(wsApp);
app.use(router);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    return next(err);
  }

  if (!(err instanceof ContinuSketchError)) {
    err = continuSketchError({
      type: "unknown",
      error: "" + err,
    });
  }

  res.status(err.httpStatus);
  res.json({ error: err.type });
});

app.listen(PORT, () => {
  console.log("Server is listening on port 3000...");
});
