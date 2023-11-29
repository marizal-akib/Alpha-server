const express = require('express');
const app = express()
require('dotenv').config()
const cors = require('cors')
const port = process.env.PORT || 5000;

//middleware

app.use(cors({
    origin:[
        "http://localhost:5173",
    ],
    credentials: true,
}));
app.use(express.json());




const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://marizalakib:pQZXjlafu5hcVbxp@cluster0.irissz7.mongodb.net/?retryWrites=true&w=majority";

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
    const photoCollection = client.db('alphaDB').collection('photos')

    // photo api

    app.get('/photos', async (req, res) => {
        const page  = parseInt(req.query.page)
        const size  = parseInt(req.query.size)
          console.log(page, size);
        const result = await photoCollection.find().skip(page*size).limit(size).toArray();
        res.send(result);
    })


    app.get('/reviews', async (req, res) => {
     
        const result = await reviewCollection.find().toArray();
        res.send(result);
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