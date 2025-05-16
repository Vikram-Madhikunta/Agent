import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

function connect() {
  return mongoose.connect(process.env.MONGO_URI);
}

connect().then( () => {
  console.log("Connected to MongoDB");
}).catch((error) => {    
  console.error(error);
});

export default connect;