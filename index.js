const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Server for assignment-10');
});

const uri = process.env.MONGODB_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run(callback) {
  try {
    await client.connect();

    await client.db('admin').command({ ping: 1 });
    console.log('MongoDB connected successfully!');

    const db = client.db('assignment-db');
    const billCollection = db.collection('Bills');
    const payCollection = db.collection('pay');

    app.get('/bills', async (req, res) => {
      const category = req.query.category;
      if (category) {
        const allBills = await billCollection.find().toArray();
        const categoryBasedBills = allBills.filter((bill) => bill.category.toLowerCase() === category);
        res.send(categoryBasedBills);
        return;
      }

      const result = await billCollection.find().toArray();
      res.send(result);
    });

    app.get('/latest-bills', async (req, res) => {
      const result = await billCollection.find().limit(6).toArray();
      res.send(result);
    });

    app.get('/bills-details/:id', async (req, res) => {
      const { id } = req.params;
      const objectId = new ObjectId(id);
      const reuslt = await billCollection.findOne({ _id: objectId });

      res.send(reuslt);
    });

    app.get('/paybillpersonal', async (req, res) => {
      const userEmail = req.query.email;
      const result = await payCollection.find({ created_by: userEmail }).toArray();
      res.send(result);
    });

    app.post('/paybill', async (req, res) => {
      const data = req.body;
      const result = await payCollection.insertOne(data);
      res.send({ result });
    });

    app.put('/paybill/:id', async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      const objectId = new ObjectId(id);

      const result = await payCollection.updateOne({ _id: objectId }, { $set: data });

      res.send(result);
    });

    app.delete('/paybill/:id', async (req, res) => {
      const { id } = req.params;
      const result = await payCollection.deleteOne({ _id: new ObjectId(id) });
      res.send({ result });
    });

    app.get('/search', async (req, res) => {
      const searchText = req.query.search;

      const result = await billCollection
        .find({
          title: { $regex: searchText, $options: 'i' },
        })
        .toArray();

      res.send(result);
    });
    callback(null);
  } catch (err) {
    callback(err);
  }
}

run((err) => {
  app.listen(PORT, async () => {
    if (err) {
      console.log('MongoDB connection failed');
    }
    console.log(`server listening on port ${PORT}`);
  });
}).catch(console.dir);
