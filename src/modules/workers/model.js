const path = require('path')
const fs = require('fs')
const { uniqRow } = require("../../lib/pg")
const { calculateTime } = require('../../lib/calctime')

const workerPostModel = async ({fish}) => {
    try {
        const last = await uniqRow('select * from workers order by worker_id desc limit 2')
        await uniqRow('insert into workers (worker_fish, worker_imgpath) values ($1,$2)', fish, (path.join(__dirname, '../', '../', '../', '../', 'face_images/') + (last.rows.length ? last.rows[1].worker_id+1 : 1) + "." + 'JPEG'))
    } catch (error) {
        console.log(error.message, 'workerPostModel')
    }
}

const workerPostImageModel = async ({file}) => {
    try {
        const last = await uniqRow('select * from workers order by worker_id desc limit 2')
        const find = (last.rows.length ? last.rows[1].worker_id+1 : 1) + "." + 'jpg'
        const filepath = path.join(__dirname, '../', '../', '../', '../', 'face_images/', find)
        file.mv(filepath, (err) => {
            if (err) {
                return {
                    status: 400,
                    message: 'error on filemove !!!'
                }
            } else {
                return {
                    status: 200,
                    message: 'worker img updated'
                }
            }
        })
    } catch (error) {
        console.log(error.message, 'workerPostImageModel')
    }
}

const workerGetTimesModel = async () => {
    try {
        const query = `
        select
        st.time_get,
        st.time_end,
        split_part(st.time_date::TEXT,'T', 1) as date,
        st.time_result,
        w.worker_id,
        w.worker_fish
        from settime as st
        inner join workers as w on w.worker_id = st.worker_id
        `
        const data = await uniqRow(query)
        
        return data.rows
    } catch (error) {
        console.log(error.message, 'workerGetTimesModel')
    }
}

const workersGetModel = async ({action}) => {
    try {
        let all
        if (action == 1) {
            const query = `
            select
            *
            from workers as w
            left join branch as b on b.branch_id = w.branch_id
            where worker_id != 1000000
            order by worker_id asc;
            `
            all = await uniqRow(query)
        } else {
            const query = `
            select
            *
            from workers as w
            inner join branch as b on b.branch_id = w.branch_id
            order by worker_id asc;
            `
            all = await uniqRow(query)
        }
        return all.rows
    } catch (error) {
        console.log(error.message, 'workersGetModel')
    }
} 

const workerPutFishModel = async ({id, fish}) => {
    try {
        const check = await uniqRow('select * from workers where worker_id = $1', id)
        if(check.rows.length){
            await uniqRow('update workers set worker_fish = $1 where worker_id = $2', fish, id)
            return 200
        } else {
            return 404
        }
    } catch (error) {
        console.log(error.message, 'workerPutFishModel')
    }
}

const workerPutImageModel = async ( id, file ) => {
    try {
        const filepath = path.join(__dirname, '../', '../', '../', '../', 'face_images/')
        fs.readdir(filepath, (err, files) => {
            if(err){
                return {
                    status: 400,
                    message: 'error on readdir !!!'
                }
            } else {
                const find = id+'.jpg'
                const finded = files.find(el => el == find)
                if (finded) {
                    const filepath = path.join(__dirname, '../', '../', '../', '../', 'face_images/', find)
                    file.mv(filepath, (err) => {
                        if (err) {
                            return {
                                status: 400,
                                message: 'error on filemove !!!'
                            }
                        } else {
                            return {
                                status: 200,
                                message: 'worker img updated'
                            }
                        }
                    })
                }
            }
        })
    } catch (error) {
        console.log(error.message, 'workerPutImageModel')
    }
}

const workersFilterModel = async ({from, to} ) => {
    try {
        const query = `
        select
        *,
        TO_CHAR(w.worker_getdate, 'DD-MM-YYYY')
        from settime as st
        inner join workers as w on w.worker_id = st.worker_id
        where TO_CHAR(st.time_date, 'DD-MM-YYYY') >= $1 and TO_CHAR(st.time_date, 'DD-MM-YYYY') < $2;
        `
        const all = await uniqRow(query, from, to)
        return all.rows
    } catch (error) {
        console.log(error.message, 'workersFilterModel')
    }
}

const workerPostTimeModel = async ( {id} ) => {
    try {
        const today = new Date().getDate()
        const fullToday = today == 12 ? today : ((1+today).toString().length > 1 ? today : '0'+today)
        const mounth = new Date().getMonth()
        const fullMounth = mounth == 12 ? mounth : ((1+mounth).toString().length > 1 ? mounth : '0'+(1+mounth))
        const year = new Date().getFullYear()
        
        let date = new Date();
        let now_utc = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(),
        date.getUTCDate(), date.getUTCHours() + 5,
        date.getUTCMinutes(), date.getUTCSeconds()))
        const minut = (now_utc.getMinutes()).toString().length < 2 ? '0'+now_utc.getMinutes(): now_utc.getMinutes()
        const gethours = (new Date().getHours() * 60) + (new Date().getMinutes())
        const hours = (now_utc.getUTCHours()) + ':' + minut
        const resultdate = `${year}-${fullMounth}-${today.toString().length == 1 ? '0'+today : today}`
        
        const checktime = await uniqRow(`select * from settime where worker_id = $1 and split_part(time_date::TEXT,'T', 1) = $2`, id, resultdate)
        
        if(checktime.rows.length){
            const asd = checktime.rows.find(el => el.time_check.length > 0)
            if((gethours - asd.time_check) <= 15){
                return {
                    status: 400,
                    message: '10 minut dan keyn urunib koring'
                }
            } else {
                const asd = checktime.rows.find(el => el.time_end)
                if (!asd) {
                    await uniqRow('update settime set time_end = $1, time_result = $3 where time_id = $2', hours, checktime.rows[0].time_id, calculateTime(checktime.rows[0].time_get, hours))
                    if (typeof id == 'number') {
                        const worker = await uniqRow('select * from workers where worker_id = $1', id)
                        return {
                            status: 200,
                            id: worker.rows[0].worker_id,
                            message: worker.rows[0].worker_fish+' shu ishchi '+ hours + ' shu soatda ishdan ketdi !'
                        }
                    }
                } else {
                    return {
                        status: 401,
                        message: 'bu ishchi bugun ishini kugatib bolgan'
                    }
                }
            }
        } else {
            if (typeof id == 'number') {
                let now_utc = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(),
                date.getUTCDate(), date.getUTCHours(),
                date.getUTCMinutes(), date.getUTCSeconds()))
                await uniqRow(`insert into settime (time_get,time_check,time_date,worker_id) values ($1, $2, $3,$4)`,hours,gethours,now_utc,id)
                const worker = await uniqRow('select * from workers where worker_id = $1', id)
                return {
                    status: 201,
                    id: worker.rows[0].worker_id,
                    message: worker.rows[0].worker_fish+' shu ishchi '+ hours + ' shu soatda ishga keldi !'
                }
            }
        }
    } catch (error) {
        console.log(error.message, 'workerPostTimeModel')
    }
}

const workerSetBranchModel = async ( {worker_id, branch_id} ) => {
    try {
        const checkBranch = await uniqRow('select * from branch where branch_id = $1', branch_id)
        const checkWorker = await uniqRow('select * from workers where worker_id = $1', worker_id)
        if (!(checkBranch.rows.length)) {
            return {
                status: 404,
                message: 'branch not found !'
            }
        } else if (!(checkWorker.rows.length)) {
            return {
                status: 404,
                message: 'worker not found !'
            }
        } else {
            await uniqRow('update workers set branch_id = $1 where worker_id = $2', branch_id, worker_id)
            return {
                status: 200,
                message: 'worker updated'
            }
        }
    } catch (error) {
        console.log(error.message, 'workerSetBranchModel')
    }
}

const workerGetBranchModel = async ( {worker_id, branch_id} ) => {
    try {
        const checkBranch = await uniqRow('select * from branch')
        return {
            status: 200,
            message: 'branches !',
            data: await checkBranch.rows
        }
    } catch (error) {
        console.log(error.message, 'workerGetBranchModel')
    }
}

module.exports = {
    workerPostModel,
    workerGetTimesModel,
    workersGetModel,
    workersFilterModel,
    workerPostTimeModel,
    workerPutFishModel,
    workerPutImageModel,
    workerPostImageModel,
    workerSetBranchModel,
    workerGetBranchModel
}