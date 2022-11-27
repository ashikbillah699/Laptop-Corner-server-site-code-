const express = require('express')
const cors = require('cors')
const app = express()
require('dotenv').config()
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

app.use(cors());
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.rhwxyri.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const categoryCollection = client.db('laptopCorder').collection('laptopData')
        const categorydataCollection = client.db('laptopCorder').collection('categorydata')
        const bookingCollection = client.db('laptopCorder').collection('bookingData')
        const usersCollection = client.db('laptopCorder').collection('users')

        app.get('/categorys', async (req, res) => {
            const query = {};
            const cursor = categoryCollection.find(query);
            const categorys = await cursor.toArray();
            res.send(categorys);
        })

        app.get('/category/:id', async (req, res) => {
            const id = req.params.id;
            const query = { service_id: id }
            const category = await categorydataCollection.find(query).toArray();
            res.send(category)
        })

        app.get('/bookings', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const bookings = await bookingCollection.find(query).toArray()
            res.send(bookings)
        })

        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            // console.log(booking);
            // const query = {
            //     _id: booking._id
            // }

            // const allReadyBooked = await bookingCollection.findOne(query).toArray;

            // if (allReadyBooked) {
            //     const message = `All Ready booked ${booking._id}`
            //     return res.send({ acknowledged: false, message })
            // }

            const result = await bookingCollection.insertOne(booking);
            res.send(result);
        })
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user)
            res.send(result);
        })
    }
    finally {

    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})