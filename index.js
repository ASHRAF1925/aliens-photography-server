const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
app.use(express.json());
const path = require("path");
const cors = require("cors");
const multer = require("multer");
const removeUploadedFiles = require("multer/lib/remove-uploaded-files");
const { MulterError } = require("multer");
const port = process.env.PORT || 5000;

app.use(cors());

//C2DOkHjuxWfLqsxP
//AlienDB

app.get("/", (req, res) => {
  res.send("API RUNNING");
});

const uri =
  "mongodb+srv://AlienDB:C2DOkHjuxWfLqsxP@cluster0.wbiuqtd.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const servicesCollection = client
      .db("AlienPhotographyDatabase")
      .collection("services");
    const reviewCollection = client
      .db("AlienPhotographyDatabase")
      .collection("reviews");

    app.post("/services", async (req, res) => {
      const service = req.body;
      console.log(service);
      const result = await servicesCollection.insertOne(service);
      res.send(result);
    });

    app.get("/home/services", async (req, res) => {
      const query = {};
      const cursor = servicesCollection.find(query).limit(3);
      const services = await cursor.toArray();
      res.send(services);
    });

    app.get("/services", async (req, res) => {
      const query = {};
      const cursor = servicesCollection.find(query);
      const services = await cursor.toArray();
      res.send(services);
    });

    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: ObjectId(id) };
      const service = await servicesCollection.findOne(query);
      console.log(service);
      res.send(service);
    });

    app.get("/services/reviews/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { serviceId: `${id}` };
      const cursor = reviewCollection.find(query);
      const reviews = await cursor.toArray();

      res.send(reviews);
    });

    app.post("/services/reviews", async (req, res) => {
      const review = req.body;
      console.log(review);
      const result = await reviewCollection.insertOne(review);
      console.log("added");
      res.send(result);
    });

    app.get("/services/reviews/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { serviceId: `${id}` };
      const cursor = reviewCollection.find(query);
      const reviews = await cursor.toArray();

      res.send(reviews);
    });

    app.get("/services/user/review", async (req, res) => {
      console.log(req.query.email);
      let query = {};
      if (req.query.email) {
        query = {
          userEmail: req.query.email,
        };
      }
      const cursor = reviewCollection.find(query);
      const reviews = await cursor.toArray();
      res.send(reviews);
    });


    app.delete('/reviews/:id',async (req,res)=>{
        const id =req.params.id;
        console.log("trying to delete",id)
        const query={_id:ObjectId(id)}
        const result=await reviewCollection.deleteOne(query);
        console.log(result);
        res.send(result)

    })















  } finally {
  }
}
run().catch((err) => console.log(err));

app.listen(port, () => console.log(`Server is running on ${port}`));
