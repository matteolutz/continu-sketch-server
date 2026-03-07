import { createRequestHandler } from "@react-router/express";
import express from "express";
import cors from "cors";

const app = express();

app.use(cors());

app.use(express.static("build/client"));

// notice that your app is "just a request handler"
app.use(
  createRequestHandler({
    // and the result of `react-router build` is "just a module"
    build: await import("./build/server/index.js"),
  }),
);

app.listen(parseInt(process.env.PORT ?? 3000), () => {
  console.log("App listening on http://localhost:3000");
});
