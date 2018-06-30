const express = require('express')
const history = require('connect-history-api-fallback')
const app = express()
app.set('port', (process.env.PORT || 3000));
app.use(history())

app.use(express.static(__dirname +'/dist'))
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
})