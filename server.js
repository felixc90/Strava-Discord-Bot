const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const userRoutes = require("./routes/user");
const guildRoutes = require("./routes/guild");
const cors = require('cors')
dotenv.config()

var app = express();

var url = process.env.MONGODB_CONNECT

mongoose
    .connect(url, {useNewUrlParser : true, useUnifiedTopology : true})
    .then(() => {
        app.use(express.json());
        app.use(cors({
            origin: 'http://localhost:3000'
        }))
        app.use("/user", userRoutes);
        app.use("/guild", guildRoutes);
        app.listen(process.env.PORT, () => {
            console.log('Your app is listening on port ' + process.env.PORT)
        })
    })


    
