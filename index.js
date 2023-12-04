const express = require('express');
const jwt = require('jsonwebtoken')
const app = express()
require('dotenv').config()
const cors = require('cors')
const port = process.env.PORT || 5000;

//middleware

app.use(cors());
app.use(express.json());




const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
    const postCollection = client.db('alphaDB').collection('post')
    const subCollection = client.db('alphaDB').collection('subs')
    const teamCollection = client.db('alphaDB').collection('teams')
    const applyCollection = client.db('alphaDB').collection('apply')
    const bookingCollection = client.db('alphaDB').collection('booking')
    const classCollection = client.db('alphaDB').collection('class')
    const packCollection = client.db('alphaDB').collection('pack')

    // jwt
    app.post('/jwt', async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '1h'
      });
      res.send({ token });

    })
    // middlewares
    const verifyToken = (req, res, next) => {
      // console.log("in verify token",req.headers.authorization);
      if (!req.headers.authorization) {
        return res.status(401).send({ message: 'unauthorized access' });
      }
      const token = req.headers.authorization.split(' ')[1];
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
          return res.status(401).send({ message: 'unauthorized access' })
        }
        req.decoded = decoded;
        next();
      })
    }

    const verifyAdmin = async (req, res, next) => {
      const email = req.decoded.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      const isAdmin = user?.role === 'admin';
      if (!isAdmin) {
        return res.status(403).send({ message: 'forbidden access' })

      }
      next()
    }
    const verifyTrainer = async (req, res, next) => {
      const email = req.decoded.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      const isTrainer = user?.role === 'trainer';
      if (!isTrainer) {
        return res.status(403).send({ message: 'forbidden access' })

      }
      next()
    }

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
    app.patch('/users', verifyToken, async (req, res) => {
      const data = req.body
      const id = req.decoded.email;
      console.log(id);
      const filter = { email: id }
      const updatedDoc = {
        $set: {

          
          name: data.name,
          profilePic: user.profilePic,


        }
      }
      const result = await userCollection.updateOne(filter, updatedDoc);
      res.send(result);
    })

    // app.get('/user/:id', async (req, res) => {
    //   const id = req.params.id
    //   const query = { _id: new ObjectId(id) }

    //   // console.log(page, size);
    //   const result = await userCollection.find(query).toArray();
    //   res.send(result);
    // })
    app.get('/users/admin/:email', verifyToken, async (req, res) => {
      const email = req.params.email;
      if (email !== req.decoded.email) {
        return res.status(403).send({ message: 'forbidden access' })

      }
      const query = { email: email };
      const user = await userCollection.findOne(query);
      let admin = false;
      if (user) {
        admin = user?.role === 'admin';
      }
      res.send({ admin });
    })
    app.get('/users/trainer/:email', verifyToken, async (req, res) => {
      const email = req.params.email;
      if (email !== req.decoded.email) {
        return res.status(403).send({ message: 'forbidden access' })

      }
      const query = { email: email };
      const user = await userCollection.findOne(query);
      let trainer = false;
      if (user) {
        trainer = user?.role === 'trainer';
      }
      res.send({ trainer });
    })
    app.get('/users/member/:email', verifyToken, async (req, res) => {
      const email = req.params.email;
      if (email !== req.decoded.email) {
        return res.status(403).send({ message: 'forbidden access' })

      }
      const query = { email: email };
      const user = await userCollection.findOne(query);
      let member = false;
      if (user) {
        member = user?.role === 'member';
      }
      res.send({ member });
    })


    // Member Management
    app.get('/member', verifyToken, async (req, res) => {
      const filter = { role: "member" }
      const result = await userCollection.find(filter).toArray();
      res.send(result);
    })
    // trainer api
    app.get('/trainer', async (req, res) => {
      const filter = { role: "trainer" }
      const result = await userCollection.find(filter).toArray();
      res.send(result);
    })

    app.get('/classPost/:id', async (req, res) => {
      const id = req.params.id
      const filter = { email: id }

      // console.log(page, size);
      const result = await userCollection.find(filter).toArray();
      res.send(result);
    })
    app.get('/team', async (req, res) => {
      const filter = { role: "trainer" }
      const page = parseInt(req.query.page)
      const size = parseInt(req.query.size)
      console.log(page, size);
      const result = await userCollection.find(filter).skip(page * size).limit(size).toArray();
      res.send(result);
    })
    app.get('/user/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await userCollection.find(query).toArray();
      res.send(result);
    })


    app.patch('/accept/:id', verifyToken, verifyAdmin, async (req, res) => {
      const data = req.body
      const id = req.params.id
      console.log(id);
      const filter = { email: id }
      const updatedDoc = {
        $set: {

          
          age: data.age,
          week: data.week,
          years_of_experience: data.years_of_experience,
          available_time_slot: data.time,
          specialty:data.specialty,
          detail_experience: data.other,
          joined: data.joined,
          lastPaid: data.lastPaid,
          skill: data.skill,
          img: data.img,
          role: data.role,
        }
      }
      const acceptResult = await userCollection.updateOne(filter, updatedDoc);
      const query = {
        _id: new ObjectId(data._id)
      }

      const deleteResult = await applyCollection.deleteOne(query);

      // delete 
      console.log('trainer info', data);
      res.send({ acceptResult, deleteResult })
    })

    app.put('/pay/:id', verifyToken, verifyAdmin, async (req, res) => {
      const pay = req.body
      const id = req.params.id
      const filter = { _id: new ObjectId(id) }
      const updatedDoc = {
        $set: {
          lastPaid: pay.lastPaid
        }
      }

      const result = await teamCollection.updateOne(filter, updatedDoc);
      res.send(result);
    })
    // trainer booking api
    app.post('/booking', async (req, res) => {
      const booking = req.body;
      const query = {
        $and: [
          { trainer_id: booking.trainer_id },
          { slotBooked: booking.slotBooked }
        ]
      };
      const existingUser = await bookingCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: 'Sorry, this slot is already booked', insertedId: null })
      }
      const result = await bookingCollection.insertOne(booking);
      res.send(result)
    })

    app.get('/bookings', async (req, res) => {
      const result = await bookingCollection.find().toArray();
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

    // application api
    app.post('/apply', async (req, res) => {
      const application = req.body;
      console.log(application);
      const result = await applyCollection.insertOne(application);
      res.send(result);
    })
    app.get('/apply', async (req, res) => {
      const result = await applyCollection.find().toArray();
      res.send(result);
    })

    // reviews api
    app.get('/reviews', async (req, res) => {

      const result = await reviewCollection.find().toArray();
      res.send(result);
    })
    // packCollection api
    app.get('/pack', async (req, res) => {
      const result = await packCollection.find().toArray();
      res.send(result);
    })


    // post api
    app.get('/posts', async (req, res) => {
      const size = parseInt(req.query.size)
      const page = parseInt(req.query.page)
      const result = await postCollection.find().skip(page * size).limit(size).toArray();
      res.send(result);
    })

    app.put('/posts/:id', async (req, res) => {
      const click = req.body
      console.log(click);
      const id = req.params.id
      const filter = { _id: new ObjectId(id) }
      const updatedDoc = {
        $set: {
          vote: click.vote
        }
      }

      const result = await postCollection.updateOne(filter, updatedDoc);
      res.send(result);
    })
    app.put('/post/:id', async (req, res) => {
      const click = req.body
      console.log(click);
      const id = req.params.id
      const filter = { _id: new ObjectId(id) }
      const updatedDoc = {
        $set: {
          vote: click.vote
        }
      }

      const result = await postCollection.updateOne(filter, updatedDoc);
      res.send(result);
    })
    app.post('/newPost', async (req, res) => {
      const newPost = req.body
      const result = await postCollection.insertOne(newPost);
      res.send(result);
    })
    //  class api
    app.get('/class', async (req, res) => {
      const result = await classCollection.find().toArray();
      res.send(result);
    })
    app.post('/class', async (req, res) => {
      const newClass = req.body
      const result = await classCollection.insertOne(newClass);
      res.send(result);
    })


    app.get('/class/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await classCollection.find(query).toArray();
      res.send(result);
    })

    // newsletter api
    app.get('/subs', async (req, res) => {

      const result = await subCollection.find().toArray();
      res.send(result);
    })

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
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
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
  console.log(`Alpha is working out on port ${port}`);
})