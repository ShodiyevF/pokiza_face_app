const path = require('path')
const { excelExportModel } = require("./model")

const excelExportCtrl = async (req, res) => {
    try {
        console.log(req.body.id);
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

const getImgByIdCtrl = async (req, res) => {
    try {
        if (req.params.id) {
            res.sendFile(path.join(__dirname, '../', '../', 'face_images/', `${req.params.id}.jpg`))
        }
    } catch (error) {
        console.log(error.message, 'getImgByIdCtrl')
    }
}

const sendExcelFileCtrl = async (req, res) => {
    try {
        console.log(path.join(__dirname, '../', '../', '../', 'Xisobot.xls'))
        res.sendFile(path.join(__dirname, '../', '../', '../', 'Xisobot.xls'))
    } catch (error) {
        console.log(error.message, 'sendExcelFileCtrl')
    }
}

module.exports = {
    excelExportCtrl,
    getImgByIdCtrl,
    sendExcelFileCtrl
}