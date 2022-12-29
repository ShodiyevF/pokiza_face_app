const { workerPostCtrl, workersGetCtrl, workersFilterCtrl, workerGetImgCtrl, workerPostTimeCtrl, workersGetTimesCtrl, workerPutFishCtrl } = require('./ctrl')

const express = require('express').Router()

express.post('/worker/post', (req, res) => workerPostCtrl(req, res))
express.get('/worker/time/get', (req, res) => workersGetTimesCtrl(req, res))
express.get('/workerall/:action', (req, res) => workersGetCtrl(req, res))
express.put('/workerput', (req, res) => workerPutFishCtrl(req, res))
express.post('/workerallfilter', (req, res) => workersFilterCtrl(req, res))
express.get('/worker/get/:id/:name', (req, res) => workerGetImgCtrl(req, res))
express.post('/worker/post/time', (req, res) => workerPostTimeCtrl(req, res))

module.exports = express