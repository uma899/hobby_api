import express from "express";
import "dotenv/config";

// This will help us connect to the database
import db from "../db/connection.js";
import jwt from "jsonwebtoken";
// This help convert the id from string to ObjectId for the _id.
import { ObjectId } from "mongodb";
import authenticateToken from "../middleware.js";

// router is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /record.
const router = express.Router();

// This section will help you get a list of all the records.
router.get("/", async (req, res) => {
  let collection = await db.collection("users");
  let results = await collection.find({}).toArray();
  res.send(results).status(200);
  //res.send("dhdt").status(200);
});

// This section will help you get a single record by id
router.get("/:name", authenticateToken, async (req, res) => {
  let collection = await db.collection("users");
  let query = { name: req.params.name };
  let result = await collection.findOne(query);

  if (!result) res.send("Not found").status(404);
  else res.send(result).status(200);
});

// This section will help you create a new record.
router.post("/register", async (req, res) => {
  try {
    let newDocument = {
      name: req.body.name,
      password: req.body.password,
      hobby: [],
      cart: [],
    };
    let collection = await db.collection("users");
    let query = { name: req.body.name };
    let result = await collection.findOne(query);
    if (req.headers.secret_key === process.env.SECRET_KEY) {
      if (!result) {
        let r = await collection.insertOne(newDocument);
        res.send(r).status(204);
      } else {
        res.send("User exists").status(403);
      }
    }
    //console.log(result)
    else {
      res.json("Unauthorised");
    }
  } catch (err) {
    console.error(err);
    //res.send("Error adding record");
  }
});

router.post("/login", async (req, res) => {
  const { name, password } = req.body;
  let query = { name: name };
  let collection = await db.collection("users");
  //console.log((req.headers.secret_key))
  const user = await collection.findOne(query);
  if (req.headers.secret_key === process.env.SECRET_KEY) {
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    } else {
      const token = jwt.sign({ username: user.name }, process.env.SECRET_KEY, {
        expiresIn: "1h",
      }); // Replace 'your-secret-key'

      res.json({ token });
    }
  }

 else{
  res.send("Unauthorised");
 }
});

// This section will help you update a record by id.
router.put("/cart/:name", authenticateToken, async (req, res) => {
  try {
    let query = { name: req.params.name };
    const updates = {
      $set: {
        cart: req.body.cart,
      },
    };

    let collection = await db.collection("users");
    let result = await collection.updateOne(query, updates);
    res.send(result).status(200);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating record");
  }
});

router.put("/hobby/:name", authenticateToken, async (req, res) => {
  try {
    let query = { name: req.params.name };
    const updates = {
      $set: {
        hobby: req.body.hobby,
      },
    };

    let collection = await db.collection("users");
    let result = await collection.updateOne(query, updates);
    res.send(result).status(200);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating record");
  }
});

// This section will help you delete a record
router.delete("/:id", async (req, res) => {
  try {
    const query = { _id: new ObjectId(req.params.id) };

    const collection = db.collection("users");
    let result = await collection.deleteOne(query);

    res.send(result).status(200);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting record");
  }
});

export default router;
