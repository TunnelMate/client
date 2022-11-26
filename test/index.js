const express = require('express')
const app = express()

app.get('/', function (req, res) {
  console.log("new req!")
  res.send('Hello World')
})

app.listen(3001, "localhost")
