require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const https = require("https");
const mongoose = require("mongoose");

const port = 5000 || process.env.PORT;

const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

//connect db
mongoose.set("strictQuery", true);
mongoose.connect("mongodb+srv://admin-shweta:"+process.env.PASSWORD+"@cluster0.vtowurn.mongodb.net/?retryWrites=true&w=majority");

//creating schema
const messageSchema = mongoose.Schema({
    name: String,
    email: String,
    message: String
});

//creating collection
const Message = mongoose.model("message", messageSchema);

app.get("/", function (req, res) {
    res.render("index", { title: "Weather", temperature: "", description: "", icon: "" });
});

app.get("/about", function (req, res) {
    res.render("about",{title:"About"});
});

app.get("/contact", function (req, res) {
    res.render("contact",{title:"Contact"});
});

//display temperature
app.post("/", function (req, res) {
    const cityName = req.body.cityName;
    const unit = "metric";
    const url = "https://api.openweathermap.org/data/2.5/weather?q="+cityName+"&units="+unit+"&appid="+process.env.API_KEY;

    //making get request to the url
    https.get(url, function (response) {
        response.on("data", function (data){
                const weatherReport = JSON.parse(data);
                const temperature = weatherReport.main.temp;
                const description = weatherReport.weather[0].description;
                const icon = weatherReport.weather[0].icon;
                const iconUrl = "http://openweathermap.org/img/wn/" + icon + "@2x.png"
            res.render("index", {
                title: "Weather",
                temperature: cityName + "'s Temperature : " + temperature+" degree celcius.",
                description: "The weather is currently " + description,
                icon: iconUrl
            });
        });
    });
});

//saving message to databse
app.post("/contact", function (req, res) {
    const message = new Message({
        name: req.body.name,
        email: req.body.email,
        message: req.body.message
    });
    message.save(function (err) {
        if(!err)
            res.redirect("/");
    });
});

app.listen(port, function (req, res) {
    console.log(`server started at port : ${port}`);
});