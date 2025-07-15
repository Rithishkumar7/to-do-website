const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

// MongoDB connection
mongoose.connect("mongodb+srv://rithishjanjeerapu007:Rithesh1778@rithesh.3fcrg3x.mongodb.net/to-do-app", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("Connected to MongoDB"))
.catch(err => console.error("MongoDB connection error:", err));

// Session configuration
app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// User Schema
const userSchema = new mongoose.Schema({
  username: String,
  password: String
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Item Schema
const itemSchema = new mongoose.Schema({
  items: {
    type: String,
    set: val => val === "" ? undefined : val,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 100
  },
  date: Date,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

const Item = mongoose.model("Item", itemSchema);

app.set("view engine", "ejs");
app.use(express.static(__dirname + '/css'));
app.use(bodyParser.urlencoded({extended: true}));

// Authentication middleware
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

// Routes
app.get("/", function(req, res) {
  res.render("home");
});

app.get("/login", function(req, res) {
  res.render("login");
});

app.get("/register", function(req, res) {
  res.render("register");
});

app.get("/secrets", isAuthenticated, function(req, res) {
  Item.find({userId: req.user._id})
    .then(foundItems => {
      const today = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      });
      res.render("list", { kindday: today, newitem: foundItems });
    })
    .catch(err => console.error("Error fetching items:", err));
});

app.get("/logout", function(req, res) {
  req.logout(function(err) {
    if (err) {
      console.log(err);
    }
    res.redirect("/");
  });
});

app.post("/register", function(req, res) {
  User.register({username: req.body.username}, req.body.password, function(err, user) {
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function() {
        res.redirect("/secrets");
      });
    }
  });
});

app.post("/login", passport.authenticate("local", {
  successRedirect: "/secrets",
  failureRedirect: "/login"
}));

app.post('/secrets', isAuthenticated, function(req, res) {
  const newItem = new Item({
    items: req.body.name,
    date: new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    }),
    userId: req.user._id
  });

  newItem.save()
    .then(() => res.redirect("/secrets"))
    .catch(err => console.error("Error saving item:", err));
});

app.listen(3002, function() {
  console.log("Server started on port 3002.");
});
