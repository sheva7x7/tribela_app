require('dotenv').config()
const express = require('express')
const path = require('path')
const history = require('connect-history-api-fallback')
const axios = require('axios')
const app = express()

const config = process.env.ENV === 'STAGING' ? require('./config-dev.json'): require('./config-prod.json')
const smRegex = /bot|google|baidu|bing|msn|duckduckbot|teoma|slurp|yandex/i

app.set('port', (process.env.PORT || 3000))
// app.use(history())

app.use(express.static(__dirname +'/dist'))
app.get('/campaign/:id', function(req,res){
  const userAgent = req.get('User-Agent')
  if (userAgent.startsWith('facebookexternalhit/1.1') || userAgent === 'Facebot' || userAgent.startsWith('Twitterbot') || smRegex.test(userAgent)){
    axios.get(`${config.baseUrl}v1/campaign/${req.params.id}`)
    .then((result) => {
      const data = result.data
      const html = `
        <!DOCTYPE html>
          <html lang="en">
          <head>
            <title>Stuff War - ${data.title}</title>
          
            <meta charset="utf-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="description" content="${data.description}" />
            
            <base href="/" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
            <meta property="og:title" content="${data.title}" />
            <meta property="og:url" content="${config.STUFFWAR_URL}campaign/${req.params.id}" />
            <meta property="og:image" content="${data.featured_image}" />
            <meta property="og:description" content="${data.description}" />

            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:site" content="@stuffwar">
            <meta name="twitter:title" content="${data.title}">
            <meta name="twitter:description" content="${data.description}" />
            <meta name="twitter:image" content="${data.featured_image}" />

            <link rel="canonical" href="https://www.stuffwar.com">
            <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
          </head>
          <body>
          <div id="app"></div>
          <script type="text/javascript" src="vendors~main.js"></script><script type="text/javascript" src="main.js"></script></body>
        </html>
        `
        res.send(html)
    })
    .catch((err) => {
      res.send(err)
    })
  }else {
    res.sendFile(path.join(__dirname + '/dist/index.html'))
  }
  
})

app.get('/article/:id', function(req,res){
  const userAgent = req.get('User-Agent')
  const postData = {
    article: {
      id: req.params.id
    }
  }
  if (userAgent.startsWith('facebookexternalhit/1.1') || userAgent === 'Facebot' || userAgent.startsWith('Twitterbot') || smRegex.test(userAgent)){
    axios.post(`${config.baseUrl}v1/article`, postData)
    .then((result) => {
      const data = result.data
      const html = `
        <!DOCTYPE html>
          <html lang="en">
          <head>
            <title>Stuff War - ${data.title}</title>
          
            <meta charset="utf-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="description" content="${data.summary}" />
            
            <base href="/" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
            <meta property="og:title" content="${data.title}" />
            <meta property="og:url" content="${config.STUFFWAR_URL}article/${req.params.id}" />
            <meta property="og:image" content="${data.thumbnail_url || ''}" />
            <meta property="og:description" content="${data.summary}" />

            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:site" content="@stuffwar">
            <meta name="twitter:title" content="${data.title}">
            <meta name="twitter:description" content="${data.summary}" />
            <meta name="twitter:image" content="${data.thumbnail_url || ''}" />

            <link rel="canonical" href="https://www.stuffwar.com">
            <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
          </head>
          <body>
          <div id="app"></div>
          <script type="text/javascript" src="vendors~main.js"></script><script type="text/javascript" src="main.js"></script></body>
        </html>
        `
        res.send(html)
    })
    .catch((err) => {
      res.send(err)
    })
  }else {
    res.sendFile(path.join(__dirname + '/dist/index.html'))
  }
  
})

app.get('/sitemap', function(req, res){
  res.sendFile(path.join(__dirname + '/dist/assets/sitemap.xml'))
})

app.get('*', function(req, res){
  res.sendFile(path.join(__dirname + '/dist/index.html'))
})

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
})