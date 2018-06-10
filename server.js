const express = require('express')
const history = require('connect-history-api-fallback')
const app = express()
app.use(history())

app.use(express.static(__dirname +'/dist'))
app.listen(3000)