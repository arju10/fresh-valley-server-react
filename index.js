const express = require("express");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5055;
console.log("user:", process.env.DB_USER);
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9hyks.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  console.log("connection error = ", err);
  const productCollection = client.db("freshValley").collection("products");
  const orderCollection = client.db("freshValley").collection("orders");

  app.get("/products", (req, res) => {
    productCollection.find().toArray((err, items) => {
      res.send(items);
    });
  });

  app.get("/product/:id", (req, res) => {
    productCollection
      .find({ _id: ObjectId(req.params.id) })
      .toArray((err, items) => {
        console.log(err, items);
        res.send(items[0]);
      });
  });

  app.get("/orders", (req, res) => {
    orderCollection.find({ email: req.query.email }).toArray((err, items) => {
      res.send(items);
      // console.log('From Database ',items)
    });
  });

  app.post("/addProduct", (req, res) => {
    const newProduct = req.body;
    console.log("adding neew product: ", newProduct);
    productCollection
      .insertOne(newProduct)
      .then((result) => {
        console.log("inserted count", result.insertedCount);
        res.send(result.insertedCount > 0);
      })
      .catch((error) => {
        console.log(error);
      });
  });

  app.post("/addOrder", (req, res) => {
    const newOrder = req.body;
    console.log("adding new order", newOrder);
    orderCollection
      .insertOne(newOrder)
      .then((result) => {
        console.log("inserted new order", result.insertedCount);
        res.send(result.insertedCount > 0);
      })
      .catch((error) => {
        console.log(error);
      });
  });

  //Delete From Manage Product
  app.delete("deleteProduct/:id", (req, res) => {
    const id = ObjectId(req.params.id);
    console.log("delete this", id);
    productCollection
      .findOneAndDelete({ _id: id })
      .then((items) => res.send(!!items.value));
  });
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get('/',(req,res)=>{
  res.send("yay! working");
})
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
