import express from "express";
import bodyParser from "body-parser";
import { start } from "./start.js";

const app = express();

const PORT = process.env.PORT || 7000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use((_, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});
app.listen(PORT);

console.log("Server run on port ", PORT);
start(app);
