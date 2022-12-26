const path = require('path')
const moment = require('moment')
const { uniqRow } = require("../../lib/pg")

const workerPostModel = async ({fish}) => {
    try {
        const last = await uniqRow('select * from workers order by worker_id desc limit 2')
        await uniqRow('insert into workers (worker_fish, worker_imgpath) values ($1,$2)', fish, (path.join(__dirname, '../', '../', 'face_images/') + (last.rows.length ? last.rows[1].worker_id+1 : 1) + "." + 'JPEG'))
    } catch (error) {
        console.log(error.message, 'workerPostModel')
    }
}

const workerGetTimesModel = async () => {
    try {
        const query = `
        select
        time_get,
        time_end,
        time_date,
        time_result,
        worker_id,
        worker_fish
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
            all = await uniqRow('select * from workers where worker_id != 1000000 order by worker_id asc;')
        } else {
            all = await uniqRow('select * from workers order by worker_id asc;')
        }
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
        const mounth = new Date().getMonth()
        const year = new Date().getFullYear()
        
        var date = new Date();
        var now_utc = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(),
        date.getUTCDate(), date.getUTCHours() + 4,
        date.getUTCMinutes(), date.getUTCSeconds()))
        const minut = (now_utc.getMinutes()).toString().length < 2 ? '0'+now_utc.getMinutes(): now_utc.getMinutes()
        const gethours = (new Date().getHours() * 60) + (new Date().getMinutes())
        const hours = (now_utc.getUTCHours()) + ':' + minut
        const resultdate = `${year}-${mounth == 12 ? mounth : mounth + 1 }-${today.toString().length == 1 ? '0'+today : today}`
        const checktime = await uniqRow(`select * from settime where worker_id = $1 and to_char(settime.time_date, 'YYYY-MM-DD') = $2`, id, resultdate)
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
                    await uniqRow('update settime set time_end = $1 where time_id = $2', hours, checktime.rows[0].time_id)
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

module.exports = {
    workerPostModel,
    workerGetTimesModel,
    workersGetModel,
    workersFilterModel,
    workerPostTimeModel
}