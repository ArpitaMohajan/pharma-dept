const express = require('express')
const { MongoClient } = require('mongodb');
// const ObjectId = require('mongodb').ObjectId

const cors = require('cors')
require('dotenv').config()
const app = express();




const port = process.env.PORT || 5000;
app.use(cors())
app.use(express.json())
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kvbsf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
// console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
async function run() {
    try {
        await client.connect();
        // console.log('kjkjkkjfkkj')
        const database = client.db('doctors_portal');
        const appointmentCollection = database.collection('appointments')
        const usersCollection = database.collection('users')
        // get
        app.get('/appointments', async (req, res) => {
            const email = req.query.email;
            const date = new Date(req.query.date).toLocaleDateString()

            const query = { email: email, date: date }
            const cursor = appointmentCollection.find(query)
            const appointments = await cursor.toArray();
            res.json(appointments)
        })




        // post appointments
        app.post('/appointments', async (req, res) => {
            const appointment = req.body
            const result = await appointmentCollection.insertOne(appointment)
            console.log(appointment)
            res.json(result)
        })

        // data admin kina varify
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email }
            const user = await usersCollection.findOne(query)
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin })
        })







        // post users
        app.post('/users', async (req, res) => {
            const users = req.body
            const result = await usersCollection.insertOne(users)
            console.log(users)
            res.json(result)
        })

        // get users

        app.put('/users', async (req, res) => {
            const user = req.body
            const filter = { email: user.email };
            // this option instructs the method to create a document if no documents match the filter
            const options = { upsert: true };
            const updateDoc = { $set: user }
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result)

        })
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            console.log('put', req.headers)

            const filter = { email: user.email }
            // const options = { upsert: true };
            const updateDoc = { $set: { role: 'admin' } }
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result)



        })


    } finally {
        //   await client.close();
    }
}
run().catch(console.dir);



















app.get('/', (req, res) => {
    res.send('Hello Doctors Sir')
})
app.listen(port, () => {
    console.log('listening to port', port)
})