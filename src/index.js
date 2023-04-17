const mongoose = require("mongoose");
const app = require("./app");
const config = require("./config/config");

let server=config.port;

// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS - Create Mongo connection and get the express app to listen on config.port
mongoose.connect(config.mongoose.url,config.mongoose.options)
.then(() => console.log("Connected to DB at", config.mongoose.url))
.catch((e) => console.log("Failed to connect to DB", config.mongoose.options));



app.listen(server,()=>console.log("Listening at",server));
