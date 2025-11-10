const express = require('express')
const cors = require('cors')
require('dotenv').config();

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = 3000

app.use(cors())
app.use(express.json())


app.get('/', (req, res) => {
  res.send('Hello World!')
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@mongodb.0ps5adl.mongodb.net/?appName=MongoDB`;

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
    await client.connect();
   
 const db = client.db('assignment-db')
 const billCollection = db.collection('Bills')
 
 app.get('/bills', async (req, res) => {
  const reuslt = await billCollection.find().toArray()
  res.send(reuslt)
 })

 app.get('/bills-details/:id', async (req, res) => {
  const {id}  = req.params
  const objectId = new ObjectId(id)
  const reuslt = await billCollection.findOne({_id : objectId})

  res.send(reuslt)
 })




    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.listen(port, () => {
  console.log(`server listening on port ${port}`)
})