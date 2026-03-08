import express from "express";
import ViteExpress from "vite-express";
import router from "./routes/index.js";

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();

app.use(router);

ViteExpress.listen(app, PORT, () =>
  console.log("Server is listening on port 3000..."),
);
