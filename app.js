const express=require("express");
const bodyParser=require("body-parser");
const mongoose = require('mongoose');
const _=require('lodash')
const dotenv=require("dotenv");

dotenv.config();

const app=express();


app.set("view engine","ejs");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));



mongoose.connect(`${process.env.mongoconnect}`, { useNewUrlParser: true});

//Created Schema
const itemsSchema = new mongoose.Schema({
    name: String
});

//Created model
const Item = mongoose.model("Item", itemsSchema);

// Creating items
const item1 = new Item({
name: "Welcome to your todo list."
});

const item2 = new Item({
name: "Hit + button to create a new item."
});

const item3 = new Item({
name: "<-- Hit this to delete an item."
});

// Storing items into an array
const defaultItems = [item1, item2, item3];

const listSchema= new mongoose.Schema({
    name:String,
    items:[itemsSchema]
})

const List=mongoose.model("List",listSchema);


    

app.get("/",function(req,res){

    Item.find()
    .then((founditems)=>{
        // console.log(founditems);
        if(founditems.length===0){
            Item.insertMany(defaultItems)
            .then(function(){
                console.log("Successfully saved into our DB.");
            })
            .catch(function(err){
                console.log(err);
            });
            res.redirect("/");
        }
        else{
            res.render("list",{
                listTitle:"Today",
                newListItems:founditems
            })  //ejs render function to show ejs file
        }
        // console.log(items);
        
    })
    .catch((err)=>{
        console.log(err);
    })
});



app.post("/", function(req, res){
 
  
 
    const itemName = req.body.newItem;
    const listName = req.body.list;
    const item = new Item({
      name : itemName
    });
   
    if(listName === "Today"){
      item.save();
      res.redirect("/")
    }else{
      List.findOne({name : listName}).then(function(foundList){
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      })
    }
  });
  

app.post("/delete",async function(req,res){

    let id = req.body.checkbox;
    let listName = req.body.listName.toLowerCase();
    if(listName === "today"){
        try {
            const item = await Item.findByIdAndDelete(id);
        } catch (err) {
            console.log(err);
        }
        return res.redirect("/");
    }
    let foundList = await List.findOne({name: listName}).exec();
    foundList.items.pull({_id: id});
    foundList.save();
    return res.redirect("/"+listName);
    

})

app.get("/:customListName",function(req,res){
    const customListName=(req.params.customListName);
    List.findOne({name : customListName}).then(foundList =>{
        if(!foundList){
          const list = new List({
            name : customListName,
            items : defaultItems
          }) 
          list.save();
          res.redirect("/" + customListName);
        }else{
          res.render("list",{listTitle:foundList.name,newListItems:foundList.items});
        }
      })
      .catch((err)=>{
        console.log(err);
      })
    
})

app.listen(3000,function(){
    console.log("Your server is signing on port 3000 sucessfully!!");
});
