const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const MongoClient = require("mongodb").MongoClient;

const port = process.env.PORT || 5555;

app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// process.env.DB_USER, DB_PASS

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.r1fla.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Collections
client.connect((err) => {
  console.log("connection err", err);
  const blogCollection = client.db("blog").collection("popularBlog");
  const adminCollection = client.db("blog").collection("admins");
  console.log("database connected successfully");

  //add Blogs
  app.post("/addPopularBlog", (req, res) => {
    const newPopularBlog = req.body;
    // console.log('adding new blog:', newPopularBlog)
    blogCollection.insertOne(newPopularBlog).then((result) => {
      console.log("inserted count", result.insertedCount);
      res.send(result.insertedCount > 0);
    });
  });

  // all Blogs
  app.get("/blogs", (req, res) => {
    blogCollection.find({}).toArray((err, items) => {
      // console.log(err, items);
      res.send(items);
    });
  });

  // single blog
  app.get("/blog/:id", (req, res) => {
    blogCollection
      .find({ _id: ObjectId(req.params.id) })
      .toArray((err, items) => {
        console.log(err, items);
        res.send(items[0]);
      });
  });

  // delete blog
  app.delete("/deleteBlog/:id", (req, res) => {
    const id = req.params.id;
    console.log(id);
    try {
      blogCollection.findOneAndDelete({ _id: ObjectId(id) }).then((result) => {
        if (result) {
          res.json({
            success: true,
            message: "Successfully Deleted",
          });
        }
      });
    } catch (e) {
      res.json({
        success: false,
        message: e,
      });
    }
  });

  //api to add new admin
  app.post("/addAdmin", (req, res) => {
    const email = req.body;
    adminCollection.insertOne(email).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  //api to check if logged user is an admin
  app.post("/isAdmin", (req, res) => {
    const email = req.body.email;
    adminCollection.find({ email: email }).toArray((err, admin) => {
      res.send(admin.length > 0);
    });
  });

  // client.close();
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
