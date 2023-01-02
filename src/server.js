const https = require('https')
const http = require('http')
const faceapi = require("@vladmandic/face-api/dist/face-api.node.js");
const express = require('express')
const fileupload = require('express-fileupload')
const fs = require('fs')
const path = require('path')
const canvas = require('canvas')
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

const app = express()
app.use(fileupload());
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

// async function loadLabeledImages(imga) {
//     const labels = fs.readdirSync(path.join(__dirname, '../','../','face_images'))
//     let counter = 1
//     return Promise.all(labels.map(async label => {
//         const descriptions = []
//         const readed = fs.readFileSync(path.join(__dirname, '../','../','face_images', (+label == 1000000 ? 1000000 : counter).toString(), (+label == 1000000 ? 1000000 : counter).toString()+'.jpg'))
//         const canvasImg = await canvas.loadImage(readed);
//         const out = await faceapi.createCanvasFromMedia(canvasImg);
//         const detections = await faceapi.detectSingleFace(out).withFaceLandmarks().withFaceDescriptor()
//         descriptions.push(detections.descriptor)
//         return new faceapi.LabeledFaceDescriptors(label, descriptions)
//     }))
// }

;(async () => {
    
    let optionsSSDMobileNet;
    console.log(`Backend: ${faceapi.tf?.getBackend()}`);
    
    console.log("Loading FaceAPI models");
    const modelPathRoot = "./models";
    const modelPath = path.join(__dirname, modelPathRoot);
    await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);
    await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);
    await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);
    await faceapi.nets.faceExpressionNet.loadFromDisk(modelPath);
    const inputSize = 512
    const scoreThreshold = 0.8
    optionsSSDMobileNet = new faceapi.SsdMobilenetv1Options({
        inputSize,
        scoreThreshold
    });
    
    await faceapi.tf.setBackend("tensorflow");
    await faceapi.tf.enableProdMode();
    await faceapi.tf.ENV.set("DEBUG", false);
    await faceapi.tf.ready();
    
    
})()

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
    res.sendFile(path.join(__dirname, '/public', '/face-recog', '/ok.mp3'))
})

app.get('/editworker', (req, res) => {
    res.sendFile(path.join(__dirname, '/public', '/pages', '/editworker.html'))
})

app.get('/addworker', (req, res) => {
    res.sendFile(path.join(__dirname, '/public', '/pages', '/index.html'))
})

app.get('/workers', (req, res) => {
    res.sendFile(path.join(__dirname, '/public', '/pages', '/workers.html'))
})

app.get('/settime', (req, res) => {
    res.sendFile(path.join(__dirname, '/public', '/pages', '/settime.html'))
})
httpServer.listen(443, console.log(443))