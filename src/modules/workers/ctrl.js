const { workerPostModel, workersGetModel, workersFilterModel, workerPostTimeModel, workerGetTimesModel, workerPutFishModel, workerPutImageModel, workerPostImageModel, workerSetBranchModel, workerGetBranchModel, workerDeleteModel } = require("./model")
const path = require('path')

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

const workerPostImageCtrl = async (req, res) => {
    try {
        const file = req.files.file
        const check = file.mimetype == 'image/jpeg'
        if (file && check) {
            workerPostImageModel(req.files)
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
        console.log(error.message, 'workerPostImageCtrl')
    }
}

const workersGetTimesCtrl = async (req, res) => {
    try {
        res.json({
            status: 200,
            data: await workerGetTimesModel()
        })
    } catch (error) {
        console.log(error.message, 'workersGetTimesCtrl')
    }
}

const workersGetCtrl = async (req, res) => {
    try {
        const all = workersGetModel(req.params)
        res.json({
            all: await all
        })
    } catch (error) {
        console.log(error.message, 'workersGetCtrl')
    }
}

const workerPutFishCtrl = async (req, res) => {
    try {
        if(req.body.id && req.body.fish){
            const model = await workerPutFishModel(req.body)
            if (model == 200) {
                return res.json({
                    status: 200,
                    message: 'worker has been update'
                })
            } else {
                return res.json({
                    status: 404,
                    message: 'worker not found'
                })
            }
        } else {
            return res.json({
                status: 400,
                message: 'error on keys'
            })
        }
    } catch (error) {
        console.log(error.message, 'workerPutFishCtrl')
    }
}

const workerPutImageCtrl = async (req, res) => {
    try {
        if(req.files.file && req.body.id){
            const model = await workerPutImageModel(req.body.id, req.files.file)
            console.log(model);
            return res.json(model)
        } else {
            return res.json({
                status: 400,
                message: 'error on keys'
            })
        }
    } catch (error) {
        console.log(error.message, 'workerPutImageCtrl')
    }
}

const workersFilterCtrl = async (req, res) => {
    try {
        if(req.body.from && req.body.to){
            const all = workersFilterModel(req.body)
            res.json({
                status: 200,
                all: await all,
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
            console.log(path.join(__dirname, '../', '../', '../', '../', 'face_images/', `${req.params.id}.jpg`));
            res.sendFile(path.join(__dirname, '../', '../', '../', '../', 'face_images/', `${req.params.id}.jpg`))
            // return res.json({
            //     status: 200,
            //     message: `Rasm jo'natildi`
            // })
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
            res.json(await workerTimeModel)
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

const workerSetBranchCtrl = async (req, res) => {
    try {
        const all = await workerSetBranchModel(req.body)
        res.json(all)
    } catch (error) {
        console.log(error.message, 'workerSetBranchCtrl')
    }
}

const workerGetBranchCtrl = async (req, res) => {
    try {
        const all = await workerGetBranchModel(req.body)
        res.json(all)
    } catch (error) {
        console.log(error.message, 'workerGetBranchCtrl')
    }
}

const workerDeleteCtrl = async (req, res) => {
    try {
        const all = await workerDeleteModel(req.body)
        res.json(all)
    } catch (error) {
        console.log(error.message, 'workerDeleteCtrl')
    }
}


module.exports = {
    workerPostCtrl,
    workersGetTimesCtrl,
    workersGetCtrl,
    workerPutFishCtrl,
    workersFilterCtrl,
    workerGetImgCtrl,
    workerPostTimeCtrl,
    workerPutImageCtrl,
    workerPostImageCtrl,
    workerSetBranchCtrl,
    workerGetBranchCtrl,
    workerDeleteCtrl
}