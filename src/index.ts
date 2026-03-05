import express from "express";
import cors from "cors";

import { startOAuth } from "./oauth/start.js";
import { oauthCallback } from "./oauth/callback.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/oauth/start", startOAuth);
app.get("/oauth/callback", oauthCallback);

app.listen(3000, () => {
  console.log("Auth server running");
});
