const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.syz7d.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const inventoryCollection = client.db('warehouse').collection('inventory');

        // AUTH
        app.post('/login', async (req, res) => {
            const inventory = req.body;
            const accessToken = jwt.sign(inventory, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
            res.send({ accessToken });
        })

        // GET
        app.get('/inventory', async (req, res) => {
            const query = {};
            const cursor = inventoryCollection.find(query);
            const inventorys = await cursor.toArray();
            res.send(inventorys);
        });

        app.get('/inventory/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const inventory = await inventoryCollection.findOne(query);
            res.send(inventory);
        })


        // POST
        app.post('/inventory', async (req, res) => {
            const newInventory = req.body;
            const result = await inventoryCollection.insertOne(newInventory);
            res.send(result);
        })

        // update inventory
        app.put('inventory/:id', async (req, res) => {
            const id = req.params.id;
            const addQuantity = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateInventory = {

                $set: {
                    quantity: newQuantity[0].quantity,
                }
            };
            const result = await inventoryCollection.updateOne(filter, updateInventory, options);
            res.send(result);
        })

        // DELETE
        app.delete('/inventory/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await inventoryCollection.deleteOne(query);
            res.send(result);
        })

    }
    finally {

    }

}

run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Running warehouse management');
});

app.listen(port, () => {
    console.log('listening to port', port);
})