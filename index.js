const express = require('express');
const app = express()
require('dotenv').config()
const cors = require('cors')
const port = process.env.PORT || 5000;

//middleware

app.use(cors({
  origin: [
    "http://localhost:5173",
  ],
  credentials: true,
}));
app.use(express.json());




const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.USER}:${process.env.PASS}@cluster0.irissz7.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const reviewCollection = client.db('alphaDB').collection('reviews')
    const userCollection = client.db('alphaDB').collection('user')
    const photoCollection = client.db('alphaDB').collection('photos')
    const postCollection = client.db('alphaDB').collection('posts')
    const subCollection = client.db('alphaDB').collection('subs')
    const teamCollection = client.db('alphaDB').collection('team')

    // user api
    app.post('/users', async (req, res) => {
      const user = req.body;
      console.log(user);
      const query = { email: user.email }
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
          return res.send({ message: 'user already exists', insertedId: null })
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
  })
  // trainer api
  app.get('/team,', async (req, res) => {
    const page = parseInt(req.query.page)
    const size = parseInt(req.query.size)
    console.log(page, size);
    const result = await teamCollection.find().skip(page * size).limit(size).toArray();
    res.send(result);
  })
    // photo api

    app.get('/photos', async (req, res) => {
      const page = parseInt(req.query.page)
      const size = parseInt(req.query.size)
      console.log(page, size);
      const result = await photoCollection.find().skip(page * size).limit(size).toArray();
      res.send(result);
    })

    // reviews api
    app.get('/reviews', async (req, res) => {

      const result = await reviewCollection.find().toArray();
      res.send(result);
    })

    // post api
    app.get('/posts', async (req, res) => {
      const size = parseInt(req.query.size)
      const page = parseInt(req.query.page)
      const result = await postCollection.find().sort({ vote: -1 }).skip(page * size).limit(size).toArray();
      res.send(result);
    })
// newsletter api
subCollection.createIndex({ email: 1 }, { unique: true });
app.post('/sub', async (req, res) => {
  const user = req.body;
  try {
    const result = await subCollection.insertOne(user);
    res.send(result);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).send('Duplicate entry found. Please provide a unique value.');
    } else {
      res.status(500).send('Internal server error');
    }
  }
})
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
app.get('/', (req, res) => {
  res.send('Alpha is running')
})

app.listen(port, () => {
  console.log(`Bistro Alpha is working out on port ${port}`);
})