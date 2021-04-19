const express = require('express')
const bodyParser = require('body-parser');
const cors = require ('cors');
const fs = require ('fs-extra');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const fileUpload = require('express-fileupload');

const port = 4000

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bejzy.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const app = express()
app.use(cors());
app.use(express.json());
app.use(express.static('clients'));
app.use(fileUpload());

client.connect(err => {
    const orderCollection = client.db(process.env.DB_NAME).collection("orders");
    const reviewCollection = client.db(process.env.DB_NAME).collection("reviews");
    const serviceCollection = client.db(process.env.DB_NAME).collection("services");
    const adminCollection = client.db(process.env.DB_NAME).collection("users");

    app.post('/addOrder', (req, res) => {
        const order = req.body;
        // console.log(order)
        orderCollection.insertOne(order)
        .then(result => {
            res.send(result.insertedCount > 0)
        })
    });

    app.get('/orders', (req, res) =>{
        orderCollection.find({})
        .toArray((err, documents) => {
          res.send(documents)
        })
    })

    app.post('/ordersSpecific', (req, res) => {
      const order = req.body.email;
      // console.log('from post orders', order)
      orderCollection.find({email:order})
      .toArray((err, documents) => {
        res.send(documents)
      })
  });





  //   app.post('/ordersByEmail', (req, res) => {
  //     const email = req.body.email;
  //     adminCollection.find({ email: email })
  //         .toArray((err, admins) => {
  //             if (admins.length === 0) {
  //                 filter.email = email;
  //             }
  //             orderCollection.find({ email: email })
  //                 .toArray((err, documents) => {
  //                     res.send(documents);
  //                 })
  //         })
  // })

  app.post('/addReview', (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const designation = req.body.designation;
    const description = req.body.description;
    const newImg = file.data;
    const encImg = newImg.toString('base64');

    var image = {
        contentType: file.mimetype,
        size: file.size,
        img: Buffer.from(encImg, 'base64')
    };

    reviewCollection.insertOne({ name, designation, description, image })
        .then(result => {
            res.send(result.insertedCount > 0);
        })
})

app.get('/reviews', (req, res) => {
  reviewCollection.find({})
      .toArray((err, documents) => {
          res.send(documents);
      })
});

app.post('/addService', (req, res) => {
  const file = req.files.file;
  const title = req.body.title;
  const description = req.body.description;
  const price = req.body.price;
  const newImg = file.data;
  const encImg = newImg.toString('base64');

  var image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, 'base64')
  };

  serviceCollection.insertOne({ title, description,price, image })
      .then(result => {
          res.send(result.insertedCount > 0);
      })
})

  app.get('/services', (req, res) => {
    serviceCollection.find({})
      .toArray((err, documents) => {
          res.send(documents);
      })
});

app.delete('/deleteService/:id', (req, res) => {
  const id = ObjectId(req.params.id);
  console.log('delete this', id);
  serviceCollection.findOneAndDelete({ _id: id })
    .then(documents => res.send(!!documents.value))
})

app.post('/makeAdmin', (req, res) => {
  const admin = req.body;
  console.log(admin)
  adminCollection.insertOne(admin)
  .then(result => {
      res.send(result.insertedCount > 0)
  })
});

app.get('/admins', (req, res) => {
  adminCollection.find({})
      .toArray((err, documents) => {
          res.send(documents);
      })
});

app.post('/isAdmin', (req, res) => {
  const email = req.body.email;
  adminCollection.find({ email: email })
      .toArray((err, admins) => {
          res.send(admins.length > 0);
      })
})

  });

app.get('/', (req, res) => {
  res.send('Hello World!')
})
app.listen(process.env.PORT || port)