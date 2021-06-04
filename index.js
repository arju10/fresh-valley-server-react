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

  app.post("/addProduct", (req, res) => {
    const newProduct = req.body;
    productCollection.insertOne(newProduct).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.get("/products", (req, res) => {
    productCollection.find({}).toArray((err, products) => {
      res.send(products);
    });
  });

  app.get("/singleProduct/:id", (req, res) => {
    productCollection
      .find({ _id: ObjectId(req.params.id) })
      .toArray((err, docs) => {
        res.send(docs[0]);
      });
  });

  app.patch("/updateProduct/:id", (req, res) => {
    productCollection
      .updateOne(
        { _id: ObjectId(req.params.id) },
        {
          $set: {
            name: req.body.name,
            price: req.body.price,
            weight: req.body.weight,
            imgUrl: req.body.imgUrl,
          },
        }
      )
      .then((result) => {
        res.send(result.modifiedCount > 0);
      });
  });

  //Delete data
  app.delete("/deleteProduct/:id", (req, res) => {
    productCollection
      .deleteOne({ _id: ObjectId(req.params.id) })
      .then((result) => {
        res.send(result.deletedCount > 0);
      });
  });

  app.post("/placeOrder", (req, res) => {
    console.log(req.body);
    const newOrder = req.body;
    orderCollection.insertOne(newOrder).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.get("/orders/:email", (req, res) => {
    orderCollection.find({ email: req.params.email }).toArray((err, docs) => {
      res.send(docs);
    });
  });
});


app.get('/',(req,res)=>{
  res.send("yay! working");
})
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
