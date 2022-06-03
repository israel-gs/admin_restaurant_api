import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import { errors } from "celebrate";

import table from "./api/table";
import category from "./api/category";
import plate from "./api/plate";
import order from "./api/order";
import user from "./api/user";
import auth from "./api/auth";

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/api", table());

app.use("/api", category());

app.use("/api", plate());

app.use("/api", order());

app.use("/api", user());

app.use("/api", auth());

app.use(errors());

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
