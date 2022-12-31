const { excelExportCtrl, getImgByIdCtrl, sendExcelFileCtrl, faceRecognitionCtrl } = require('./ctrl')


const fs = require('fs')
const path = require('path')
const { uniqRow } = require('../../lib/pg');
const multer = require('multer');
const express = require('express').Router()

try {
    const storage = multer.diskStorage({
        destination: function(req, file, cb) {
            cb(null, path.join(__dirname, '../', '../', '../', '../', 'face_images/', ))
        },
        filename: async function(req, file, cb) {
            const findedFile = fs.existsSync(path.join(__dirname, '../', '../', '../', '../', 'face_images/', req.params.id + '.jpg'))
            if (req.params.id) {
                if(findedFile){
                    cb(null, req.params.id + ".jpg")
                }
            } else {
                const last = await uniqRow('select * from workers order by worker_id desc limit 2;')
                cb(null, (last.rows[1] ? last.rows[1].worker_id : 1) + ".jpg")
            }
        }
    })
    const upload = multer({ storage: storage });
    
    express.post('/excelexport', (req, res) => excelExportCtrl(req,res))
    express.get('/img/:id', (req, res) => getImgByIdCtrl(req, res))
    express.get('/xisobot', (req, res) => sendExcelFileCtrl(req, res))
    express.post('/worker/post/img', upload.single('test'), (req, res) => {})
    express.put('/worker/put/img/:id', upload.single('testa'), (req, res) => {})
    express.post('/facerecognation', (req, res) => faceRecognitionCtrl(req, res))
} catch (error) {
    console.log(error.message)
}

module.exports = express