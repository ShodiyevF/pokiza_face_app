const path = require('path')
const { uniqRow } = require("../../lib/pg")

const workerPostModel = async ({fish}) => {
    try {
        const last = await uniqRow('select * from workers order by worker_id desc limit 1')        
        await uniqRow('insert into workers (worker_fish, worker_imgpath) values ($1,$2)', fish, (path.join(__dirname, '../', '../', 'face_images/') + (last.rows.length ? last.rows[0].worker_id+1 : 1) + "." + 'JPEG'))
    } catch (error) {
        console.log(error.message, 'workerPostModel')
    }
}

const workersGetModel = async () => {
    try {
        const all = await uniqRow('select * from workers')
        return all.rows
    } catch (error) {
        console.log(error.message, 'workersGetModel')
    }
} 

const workersFilterModel = async ({from, to} ) => {
    try {
        const query = `
        select
        *,
        TO_CHAR(w.worker_getdate, 'DD-MM-YYYY')
        from workers as w
        where TO_CHAR(w.worker_getdate, 'DD-MM-YYYY') >= $1 and TO_CHAR(w.worker_getdate, 'DD-MM-YYYY') < $2;
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
        const mounth = new Date().getMonth()
        const year = new Date().getFullYear()
        
        const gethours = (new Date().getHours() * 60) + (new Date().getMinutes())
        const hours = new Date().getHours() + ':' + new Date().getMinutes()
        const resultdate = `${year}-${mounth == 12 ? mounth : mounth + 1 }-${today.toString().length == 1 ? '0'+today : today}`
        const checktime = await uniqRow(`select * from settime where worker_id = $1 and to_char(settime.time_date, 'YYYY-MM-DD') = $2`, id, resultdate)
        if (checktime.rows.length) {
            const asd = checktime.rows.find(el => el.time_check.length > 0)
            if((gethours - asd.time_check) <= 15){
                return {
                    status: 400,
                    message: '10 minut dan keyn urunib koring'
                }
            } else {
                const asd = checktime.rows.find(el => el.time_end)
                if (!asd) {
                    await uniqRow('update settime set time_end = $1 where time_id = $2', hours, checktime.rows[0].time_id)
                    if (typeof req.body.id == 'number') {
                        const worker = await uniqRow('select * from workers where worker_id = $1', req.body.id)
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
            if (typeof req.body.id == 'number') {
                await uniqRow(`insert into settime (time_get,time_check,worker_id) values ($1, $2, $3)`,hours,gethours,req.body.id)
                const worker = await uniqRow('select * from workers where worker_id = $1', req.body.id)
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

module.exports = {
    workerPostModel,
    workersGetModel,
    workersFilterModel,
    workerPostTimeModel
}