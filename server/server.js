const express      = require("express"); 
const cors         = require("cors");
const app          = express(); 
const rootEndpoint = require("./routes/index.js"); 

app.use(express.json());
app.use(express.urlencoded());
app.use(cors({ 
    origin: "*", 
    credentials: true, 
    origin: true }
)); 

// allow client to request to the server 
app.use("/api", rootEndpoint); 

app.listen(5000, () => console.log("Listening on port 5000"));