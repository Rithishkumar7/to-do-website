const express=require("express");
const app=express();
const mongoose =require("mongoose");
const bodyParser=require("body-parser")
mongoose.connect("mongodb+srv://rithishjanjeerapu007:Rithesh1778@rithesh.3fcrg3x.mongodb.net/to-do-app", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("Connected to MongoDB"))
.catch(err => console.error("MongoDB connection error:", err));
var items=[];

const schema=new mongoose.Schema({
 items: {
    type: String,
    set: val => val === "" ? undefined : val,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 100
  },
     date:Date


});
const item=mongoose.model("item",schema);

app.set("view engine","ejs");
app.use(express.static(__dirname + '/css'));


app.get('/', (req, res) => {
  item.find()
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
app.use(bodyParser.urlencoded({extended: true}));
app.post('/', (req, res) => {
  const newItem = new item({
    items: req.body.name,
    date: new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    })
  });

  newItem.save()
    .then(() => res.redirect("/"))
    .catch(err => console.error("Error saving item:", err));
});
app.listen(3002);
