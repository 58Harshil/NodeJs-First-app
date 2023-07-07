/*import http from "http"
import {generateLovePercent} from "./features.js"
import fs from "fs"
import path from "path" 
//console.log(path.extname("/home/random/inde.js"));
//import { log } from "console"

 /*const home = fs.readFile("./index.html", function(){
    console.log("File read");
 })*/
 /*const home = fs.readFileSync("./index.html")
 console.log(home);*/
 //console.log(home);
//console.log(generateLovePercent())*/
 /*const server = http.createServer(function(req,res){
    console.log(req.method);
   if(req.url==="/about"){
    res.end(`<h1>Love is ${generateLovePercent()}</h1>`)
   }
   else if(req.url==="/"){
    res.end("home")
   }
   else if(req.url==="/contact"){
    res.end("<h1>Contact Page</h1>")
   }
   else{
    res.end("<h1>Page not found</h1>")
   }
    
 });
 server.listen(5000,function(){
    console.log("Sever is working");
 })*/



 //express js

 /*import  Express from "express";
 import path from 'path'
 const app = Express() 
 app.get("/",(req,res)=>{
    /*res.json({
      success:true,
      products:[]

    })
    //res.status(400).send("Mari Marzi")
    const pathlocation = path.resolve()
    //res.sendFile(path.join(pathlocation,"./NodeJs/index.html"))
    res.render()
})
 app.listen(5000,()=>{
    console.log( "Server is working");
})*/


// EJS
import express from "express";
import path from "path";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken"; //creating and verifying JSON Web Tokens
import bcrypt from "bcrypt"; //password in harsh value

const app = express();

// Setting up middlewares
app.use(express.static(path.join(path.resolve(), "NodeJs", "views")));
app.use(express.urlencoded({ extended: true }));

// Setting up view engine
app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "NodeJs", "views"));
app.use(cookieParser());

// Connect to MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/backend", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Database connected"))
  .catch((e) => console.log(e));

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});

const User = mongoose.model("User", userSchema);

const isAuthenticated = async (req, res, next) => {
  const { token } = req.cookies;
  if (token) {
    try {
      const decoded = jwt.verify(token, "your-secret-key");
      req.user = await User.findById(decoded._id);
      next();
    } catch (err) {
      res.clearCookie("token");
      res.redirect("/login");
    }
  } else {
    res.redirect("/login");
  }
};

app.get("/", isAuthenticated, (req, res) => {
  res.render("logout", { name: req.user.name });
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  let user = await User.findOne({ email });
  if (user) {
    return res.redirect("/login");
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  user = await User.create({ name, email, password: hashedPassword });
  const token = jwt.sign({ _id: user._id }, "your-secret-key");
  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + 60 * 1000),
  });
  res.redirect("/");
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  let user = await User.findOne({ email });
  if (!user) {
    return res.redirect("/register");
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.render("login", { message: "Incorrect Password" });
  }
  const token = jwt.sign({ _id: user._id }, "your-secret-key");
  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + 60 * 1000),
  });
  res.redirect("/");
});

app.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/login");
});

app.get("/login", (req, res) => {
  res.clearCookie("token");
  res.render("login");
});

app.listen(5000, () => {
  console.log("Server is working");
});
