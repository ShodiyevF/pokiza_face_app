const { workerPostModel, workersGetModel, workersFilterModel, workerPostTimeModel } = require("./model")

const workerPostCtrl = async (req, res) => {
    try {
        if (req.body.fish) {
            workerPostModel(req.body)
            return res.json({
                status: 200,
                message: `QO'SHILDI`
            })
        } else {
            return res.json({
                status: 400,
                message: `Jo'natishda hatolik`
            })
        }
    } catch (error) {
        console.log(error.message, 'workerPostCtrl')
    }
}

const workersGetCtrl = async (req, res) => {
    try {
        const all = workersGetModel()
        res.json({
            all: await all
        })
    } catch (error) {
        console.log(error.message, 'workersGetCtrl')
    }
}

const workersFilterCtrl = async (req, res) => {
    try {
        if(req.body.from && req.body.to){
            const all = workersFilterModel()
            res.json({
                status: 200,
                all,
                message: `ishchilar ro'yhati jo'natildi`
            })
        } else {
            res.json({
                status: 400,
                message: 'hatolik'
            })
        }
    } catch (error) {
        console.log(error.message, 'workersFilterCtrl')
    }
}

const workerGetImgCtrl = async (req, res) => {
    try {
        if(req.params.id){
            res.sendFile(path.join(__dirname, '../', '../', 'face_images/', `${req.params.id}.jpg`))
            return res.json({
                status: 200,
                message: `Rasm jo'natildi`
            })
        } else {
            return res.json({
                status: 400,
                message: 'hatolik'
            })
        }
    } catch (error) {
        console.log(error.message, 'workerGetImgCtrl')
    }
}

const workerPostTimeCtrl = async (req, res) => {
    try {
        if(req.body.id){
            const workerTimeModel = workerPostTimeModel(req.body)
            res.json(workerTimeModel)
            // if(workerTimeModel.status == 200){
            // } 
        } else {
            return res.json({
                status: 400,
                message: 'hatolik'
            })
        }
    } catch (error) {
        console.log(error.message, 'workerPostTimeCtrl')
    }
}

module.exports = {
    workerPostCtrl,
    workersGetCtrl,
    workersFilterCtrl,
    workerGetImgCtrl,
    workerPostTimeCtrl
}