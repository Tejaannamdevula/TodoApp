import { connect } from "mongoose";
import { app } from "./app.js";
import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config({
  path: "./.env", //expects .env in root
});

const Port = process.env.PORT || 3000;

// connectDB()
//   .then()
//   .catch((err) => {
//     console.log(`MongoDB connection error ${err}`);
//   });
// app.listen(Port, () => {
//   console.log(`server is listening at port ${Port}`);
// });
connectDB()
  .then(() => {
    app.listen(Port, () => {
      console.log(`server is listening at port ${Port}`);
    });
  })
  .catch((err) => {
    console.log(`MongoDB connection error ${err}`);
  });
