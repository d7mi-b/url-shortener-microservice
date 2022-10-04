require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const e = require('express');
const mongoose = require('mongoose');
const dns = require('dns');

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

//Connect to database
const url = 'mongodb+srv://d7mi:D7mi1998@nodetuts.hazfv.mongodb.net/?retryWrites=true&w=majority';
mongoose.connect(url, { useNewUrlParser : true , useUnifiedTopology: true })
    .then((result) => {
        console.log(`Listening on port ${port}`);
        app.listen(port)
    })
    .catch(err => {
        console.log(err)
    });

const Schema = mongoose.Schema;

const URL_Schema = new Schema({
    original_url: { type: String },
    short_url: { type: Number }
});

const URL = mongoose.model('FCC.URL-Shortener', URL_Schema);

// support parsing of application/json type post data
app.use(bodyParser.json());

//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', function(req, res) {
  const original_url = req.body.url;

  dns.lookup(original_url, (err, address) => {
    if (!err) {
      URL.findOne({ original_url: original_url })
      .then(find => {
        if (!find) {
          URL.findOne({ })
          .sort({$natural: -1})
          .then(last => {
            let short_url
            if (last) {
              short_url = last.short_url + 1
            }
            else {
              short_url = 1
            }
            URL.create({
              original_url: original_url,
              short_url,
            })
            .then(result => {
              return res.json({
                "original_url": result.original_url,
                "short_url": result.short_url
              })
            })
            .catch(err => console.log(err))
          })
          .catch(err => console.log(err));
        } else if (find) {
          return res.json({
            "original_url": find.original_url,
            "short_url": find.short_url
          })
        }
      })
    }
    else if (err) {
      return res.json({ error: 'invalid url' });
    }
  })
});

app.get('/api/shorturl/:short_url?', function(req, res) {
  const short_url = req.params.short_url;
  
    if (!isNaN(short_url)) {
      URL.findOne({ short_url: req.params.short_url })
      .then(result => {
        if (result)
          res.redirect(result.original_url);
        else
          res.json({ error: "NOT FOUND" })
      })
      .catch(err => console.log(err));
    }
    else
      res.json({ error: "NOT FOUND" })
});
