//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// connect to mongoose
mongoose.connect("mongodb+srv://admin-sabiq:Sabiq123@cluster0.bp8ikap.mongodb.net/todolistDB", { useNewUrlParser: true, useUnifiedTopology: true });
console.log("connected to the server");

// item schema for todolistDB
const itemSChema = new mongoose.Schema(
    {
        name: String,
    },
    { versionKey: false }
);

// item model for todolistDb

const Item = new mongoose.model("Item", itemSChema);

const slut1 = new Item({
    name: "Welcome to your todolist!",
});

const slut2 = new Item({
    name: "Hit the + button to add a new item.",
});

const slut3 = new Item({
    name: "Check the box to delete an item.",
});

const urlSchema = new mongoose.Schema(
    {
        name: String,
        items: [itemSChema],
    },
    { versionKey: false }
);

const Url = new mongoose.model("Url", urlSchema);

const defaultItems = [slut1, slut2, slut3];

app.get('/favicon.ico', (req, res) => res.status(204).end());

app.get("/", function (req, res) {
    Item.find()
        .then(function (itemsFound) {
            if (itemsFound.length === 0) {
                Item.insertMany([slut1, slut2, slut3])
                    .then(function () {
                        console.log("Successfully added!");
                    })
                    .catch(function (err) {
                        console.log(err);
                    });
                res.redirect("/");
            } else {
                res.render("list", { listTitle: "Today", newListItems: itemsFound });
            }
        })
        .catch(function (err) {
            console.log(err);
        });
});

app.post("/", function (req, res) {
    const itemName = req.body.newItem;
    const listName = req.body.list;
    const newSlut = new Item({
        name: itemName,
    });

    if (listName === "Today") {
        newSlut.save();
        res.redirect("/");
    } else {
        Url.findOne({ name: listName })
            .then(function (found) {
                found.items.push(newSlut);
                found.save();
                res.redirect("/" + listName);
            })
            .catch(function (err) {
                console.log(err);
            });
    }
});

app.post("/delete", function (req, res) {
    const checkedItem = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today") {
        Item.findByIdAndDelete(checkedItem)
            .then(function () {
                console.log("Item has been deleted.");
            })
            .catch(function (err) {
                console.log(err);
            });
        res.redirect("/");
    } else {
        Url.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItem } } })
            .then(function (foundList) {
                res.redirect("/" + listName);
            })
            .catch(function (err) {
                console.log(err);
            });
    }
});

app.get("/:customUrl", function (req, res) {
    const urlRequested = _.capitalize(req.params.customUrl);

    Url.findOne({ name: urlRequested })
        .then(function (urlFound) {
            if (!urlFound) {
                const newUrl = new Url({
                    name: urlRequested,
                    items: defaultItems,
                });
                newUrl.save();

                res.redirect("/" + urlRequested);
            } else {
                res.render("list", { listTitle: urlFound.name, newListItems: urlFound.items });
            }
        })
        .catch(function (err) {
            console.log(err);
        });
});

app.get("/about", function (req, res) {
    res.render("about");
});

app.listen(3000, function () {
    console.log("Server started on port 3000");
});
