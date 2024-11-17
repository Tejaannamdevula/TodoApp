import mongoose from "mongoose";

import { DB_NAME } from "../constants.js";

//DB is always in another continent use async

// use try catch for errors

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_URL}/${DB_NAME}`
    );

    console.log(
      `\n Mongo db connected!! DB host :${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("Mongodb connection error", error);
    process.exit(1);
  }
};

export default connectDB;
