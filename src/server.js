const https = require('https')
const http = require('http')

const express = require('express')
const fs = require('fs')
const path = require('path')

const app = express()
let httpServer = http.createServer(app)

process.env.NODE_ENV = 'production';
console.log(process.env.NODE_ENV)
if (process.env.NODE_ENV === 'production') {
    httpServer = https.createServer({
        cert: fs.readFileSync('/etc/letsencrypt/live/abubakr.uz/cert.pem', 'UTF-8'),
        key: fs.readFileSync('/etc/letsencrypt/live/abubakr.uz/privkey.pem', 'UTF-8'),
        ca: fs.readFileSync('/etc/letsencrypt/live/abubakr.uz/fullchain.pem', 'UTF-8')
    }, app)
}

const basePath = path.join(__dirname, './public')
const basePatha = path.join(__dirname, './public/face-recog')
const basePathw = path.join(__dirname, './public/pages')

app.use(express.static(basePath))
app.use(express.static(basePatha))
app.use(express.static(basePathw))
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

const workers = require('./modules/workers')
const time = require('./modules/time')

app.use(workers)
app.use(time)


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/public', '/index.html'))
})

app.get('/facerecog', (req, res) => {
    res.sendFile(path.join(__dirname, '/public', '/face-recog', '/index.html'))
})

app.get('/test', (req, res) => {
    res.sendFile(path.join(__dirname, '/public', '/face-recog', '/test.html'))
})

app.get('/addworker', (req, res) => {
    res.sendFile(path.join(__dirname, '/public', '/pages', '/index.html'))
})

app.get('/workers', (req, res) => {
    res.sendFile(path.join(__dirname, '/public', '/pages', '/workers.html'))
})

httpServer.listen(443, console.log(443))