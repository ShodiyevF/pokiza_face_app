const path = require('path')
const { excelExportModel, faceRecognitionModel } = require("./model")

const excelExportCtrl = async (req, res) => {
    try {
        if(req.body.id){
            excelExportModel(req.body)
            return res.json({
                status: 200,
                message: `o'xshadi`
            })
        } else {
            return res.json({
                status: 400,
                message: `error`
            })
        }
    } catch (error) {
        console.log(error.message, 'excelExportCtrl')
    }
}


const faceRecognitionCtrl = async (req, res) => {
    try {
        if (req.files.file) {
            const data = await faceRecognitionModel(req.files.file)
            return res.json({
                data: data
            })
        }
    } catch (error) {
        console.log(error.message, 'faceRecognitionCtrl')
    }
}

const getImgByIdCtrl = async (req, res) => {
    try {
        if (req.params.id) {

            res.sendFile(path.join(__dirname, '../', '../','../', '../', 'face_images/', `${req.params.id}.jpg`))
        }
    } catch (error) {
        console.log(error.message, 'getImgByIdCtrl')
    }
}

const sendExcelFileCtrl = async (req, res) => {
    try {
        res.sendFile(path.join(__dirname, '../', '../', '../', 'Xisobot.xls'))
    } catch (error) {
        console.log(error.message, 'sendExcelFileCtrl')
    }
}

module.exports = {
    excelExportCtrl,
    getImgByIdCtrl,
    sendExcelFileCtrl,
    faceRecognitionCtrl
}