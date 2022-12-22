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

require("dotenv").config();

app.use(cors());

app.get("/", (req, res) => {
  res.send("API RUNNING");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.wbiuqtd.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

//function for JWT Verification
function verifyJWT(req, res, next) {
  const authheader = req.headers.authorization;

  if (!authheader) {
    res.status(401).send({ message: "unauthorized access" });
  }
  const token = authheader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
    if (err) {
      res.status(403).send({ message: "not valid token" });
    }
    req.decoded = decoded;
    console.log("from", req.decoded);
    next();
  });
}

async function run() {
  try {
    const servicesCollection = client
      .db("AlienPhotographyDatabase")
      .collection("services");
    const reviewCollection = client
      .db("AlienPhotographyDatabase")
      .collection("reviews");
    //api for jwt token
    app.post("/jwt", (req, res) => {
      const user = req.body;
      console.log(user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN, {
        expiresIn: "5d",
      });
      console.log({ token });
      res.send({ token });
    });

    //api for inserting Service

    app.post("/services", async (req, res) => {
      const service = req.body;
      console.log(service);
      const result = await servicesCollection.insertOne(service);
      res.send(result);
    });

    //api for getting home services

    app.get("/home/services", async (req, res) => {
      const query = {};
      const cursor = servicesCollection.find(query).limit(3);
      const services = await cursor.toArray();
      res.send(services);
    });
    //api for getting all services
    app.get("/services", async (req, res) => {
      const query = {};
      const cursor = servicesCollection.find(query);
      const services = await cursor.toArray();
      res.send(services);
    });

    //api for getting specific service

    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: ObjectId(id) };
      const service = await servicesCollection.findOne(query);
      console.log(service);
      res.send(service);
    });

    //api for geting review according to service

    app.get("/services/reviews/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      console.log("from getservices")
      const query = { serviceId: `${id}` };
      const cursor = reviewCollection.find(query).sort({ timeandDate: -1 });
      const reviews = await cursor.toArray();

      res.send(reviews);
    });
    //api for inserting review
    app.post("/services/reviews", async (req, res) => {
      const review = req.body;
      console.log(review);
      const result = await reviewCollection.insertOne(review);
      console.log("added");
      res.send(result);
    });

    // app.get("/services/reviews/:id", async (req, res) => {
    //   const id = req.params.id;
    //   console.log(id);
    //   const query = { serviceId: `${id}` };
    //   const cursor = reviewCollection.find(query).sort({"timeandDate":1});
    //   const reviews = await cursor.toArray();

    //   res.send(reviews);
    // });
    // verifyJWT,

    //api for getting specific user review
    app.get("/services/user/review", verifyJWT, async (req, res) => {
      // console.log("from myreview")
      //   console.log(req.decoded);

      const decoded = req.decoded;
      if (decoded.email == req.query.email) {
        console.log("well done")
      }

      if (decoded.email !== req.query.email) {
        res.status(403).send({ message: "Forbiden access" });
      }

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

    //api for delete

    app.delete("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      console.log("trying to delete", id);
      const query = { _id: ObjectId(id) };
      const result = await reviewCollection.deleteOne(query);
      console.log(result);
      res.send(result);
    });

    //api for updating comment

    app.put("/myreviews/update/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const option = { upsert: true };
      const updatedreview = req.body;
      const updated_cooment = {
        $set: {
          timeandDate: updatedreview.timeandDate,
          comment: updatedreview.comment,
          rating: updatedreview.rating,
          servicename: updatedreview.servicename,
          serviceId: updatedreview.serviceId,
          userEmail: updatedreview.userEmail,
          userName: updatedreview.userName,
          userPhoto: updatedreview.userPhoto,
          servicePhoto: updatedreview.servicePhoto,
        },
      };

      const result = await reviewCollection.updateOne(
        filter,
        updated_cooment,
        option
      );
      res.send(result);
      console.log(updatedreview);
    });

    //api for geting specific review to update

    app.get("/myreviews/update/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: ObjectId(id) };
      const service = await reviewCollection.findOne(query);
      console.log(service);
      res.send(service);
    });
  } finally {
  }
}
run().catch((err) => console.log(err));

app.listen(port, () => console.log(`Server is running on ${port}`));
