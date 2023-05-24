require("dotenv").config();
const express = require("express")
const ejs = require("ejs");
const bodyparser = require("body-parser")
const mongoose = require("mongoose")
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose=require("passport-local-mongoose");
const e = require("express");
const app = express();
app.use(bodyparser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(session({
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:false
}))
app.use(passport.initialize());
app.use(passport.session());
  
const bookList = [];
const userList=[];
const adminList=[];
mongoose.connect("mongodb+srv://"+process.env.DB_CONNECT+":"+process.env.DB_CONNECTT+"@cluster0.7nyopqj.mongodb.net/mylendDB", {useNewUrlParser:true});
// mongoose.set("useCreateIndex",true)

const userSchema = new mongoose.Schema({
    name:String,
    email:String,
    password:String
})
const bookSchema = new mongoose.Schema({
    title:String,
    authorName:String,
    published:String
    // img:File
})
const personSchema = new mongoose.Schema({
    name:String,
    email:String,
    phone:String
})


userSchema.plugin(passportLocalMongoose);

const User =new mongoose.model("User", userSchema);
const Book =new mongoose.model("Book", bookSchema);
const Person = new mongoose.model("Person", personSchema)

passport.use(User.createStrategy())

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.post("/register", async function(req, res){

    const people= new Person({
        name:req.body.name,
        email:req.body.username,
        phone:req.body.phone
        
    })
    await people.save()
    User.register({username:req.body.username}, req.body.password, (err, user)=>{

        
        if(err){
            console.log(err);
            res.redirect("/register");
        }
        else{
            passport.authenticate("local")(req, res, ()=>{
                res.render("home")
            })
        }
    })


});


app.post("/login", async function(req, res){

    const user =new User({
        username:req.body.username,
        password:req.body.password
    });
    req.login(user, (err)=>{
        if (err){
            console.log(err);
        }else{
            passport.authenticate("local")(req, res, (err, user)=>{
            res.render("home")
            })
        }
    })

});


app.get("/home", (req, res)=>{
    if (req.isAuthenticated()){
        res.render("home") 
    }
    else{
        res.redirect("/login")
    }
})


app.get("/logout", (req, res) => {
    req.logout(req.user, err => {
      if(err) return next(err);
      res.redirect("/login");
    });
  });


app.post("/addbook", async (req, res)=>{
    const books = new Person({
        title:req.body.title,
        authorName:req.body.author,
        published:req.body.Published,
        img:req.body.image
    })
    await books.save();
    res.redirect("/books")
})

app.get("/books",async (req, res)=>{
    const foundbooklist = await Book.find({})
    if(foundbooklist.length === 0){
        await Book.insertMany(bookList);
        res.render("books")
    }else{
        res.render("books", {newBookList:foundbooklist})
    }
})

app.post("/delete", async (req, res)=>{
    const deleteBook = await Book.deleteOne({_id:req.body.checkbox})
    if(deleteBook){
        res.redirect("/books")
    }
})

app.post("/updatebook", async (req, res)=>{
    res.render("updatebook")
    await Book.updateOne({title:req.body.title}, {
        title:req.body.retitle,
        authorName:req.body.author,
        published:req.body.published
    })
    res.redirect("/books")

})







app.get("/addbook", function(req, res){
    res.render("addbook")
})
app.get("/updatebook", function(req, res){
    res.render("updatebook")
})



app.get("/members",async function(req, res){
    const foundUser = await Person.find({})
    if(foundUser.length === 0){
        await Person.insertMany(userList)
        res.render("members")

    }
    else{
        res.render("members", {newUserList:foundUser})
    }
})

app.post("/deleteUser", async (req, res)=>{
    const deleteUser = await Person.deleteOne({_id:req.body.checkbox})
    if(deleteUser){
        res.redirect("/members")
    }
    
})



app.get("/login", (req, res)=>{
    res.sendFile(__dirname+"/index.html")
})
app.get("/register", (req, res)=>{
    res.sendFile(__dirname+"/register.html")
})
app.listen(3000, () =>{
    console.log("secuussfully");
})