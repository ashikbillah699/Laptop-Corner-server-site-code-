const express = require('express')
const cors = require('cors')
const app = express()
require('dotenv').config()
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { query } = require('express');

app.use(cors());
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.rhwxyri.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
    console.log('token', req.headers.authorization)
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('unauthorization access')
    }
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded
        next()
    })
}

async function run() {
    try {
        const categoryCollection = client.db('laptopCorder').collection('laptopData')
        const categorydataCollection = client.db('laptopCorder').collection('categorydata')
        const bookingCollection = client.db('laptopCorder').collection('bookingData')
        const usersCollection = client.db('laptopCorder').collection('users')
        // const productCollection = client.db('laptopCorder').collection('product')

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

        app.get('/bookings', verifyJWT, async (req, res) => {
            const email = req.query.email;
            const decodedEmail = req.decoded.email;
            if (email !== decodedEmail) {
                return res.status(403).send({ message: 'forbidden access' })
            }
            const query = {}
            const bookings = await bookingCollection.find(query).toArray()
            res.send(bookings)
        })

        app.delete('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await bookingCollection.deleteOne(query);
            console.log(result)
            res.send(result);
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

        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const user = await usersCollection.findOne(query);
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '24h' })
                return res.send({ accessToken: token })
            }
            console.log(user)
            res.status(403).send({ accessToken: '' })
        })

        app.delete('/users/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await usersCollection.deleteOne(filter);
            res.send(result);
        })

        app.get('/users', async (req, res) => {
            const query = {};
            const users = await usersCollection.find(query).toArray()
            res.send(users)
        })

        app.post('/users', verifyJWT, async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user)
            res.send(result);
        })

        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await usersCollection.findOne(query);
            res.send({ isAdmin: user?.role === 'admin' });
        })

        app.put('/users/admin/:id', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const query = { email: decodedEmail }
            const user = await usersCollection.findOne(query)
            if (user?.role !== 'admin') {
                return res.status(403).send({ message: 'forbidden access' })
            }

            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    role: 'admin'
                }
            }
            const result = await usersCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        })

        app.get('/categoryName', async (req, res) => {
            const query = {}
            const result = await categoryCollection.find(query).project({ title: 1, service_id: 1 }).toArray();
            res.send(result)
        })

        // app.get('/product', async (req, res) => {
        //     const query = {};
        //     const product = await productCollection.find(query).toArray();
        //     res.send(product)
        // })

        app.post('/product', async (req, res) => {
            const product = req.body;
            const result = await categorydataCollection.insertOne(product)
            res.send(result)
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