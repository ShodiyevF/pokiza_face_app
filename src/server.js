const https = require('https')
const http = require('http')

const express = require('express')
const fs = require('fs')
const path = require('path')
const multer = require('multer');

const { uniqRow } = require('./lib/pg');
const { daysInCurrentMonth } = require('./lib/getday');
const { calculateTime, timeConvert } = require('./lib/calctime');

const app = express()
let httpServer = http.createServer(app)

// process.env.NODE_ENV = 'production';
// console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'production') {
    httpServer = https.createServer({
        cert: fs.readFileSync('/etc/letsencrypt/live/abubakr.uz/cert.pem', 'UTF-8'),
        key: fs.readFileSync('/etc/letsencrypt/live/abubakr.uz/privkey.pem', 'UTF-8'),
        ca: fs.readFileSync('/etc/letsencrypt/live/abubakr.uz/fullchain.pem', 'UTF-8')
    }, app)
}

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join(__dirname, '../', '../', 'face_images/'))
    },
    filename: async function(req, file, cb) {
        const last = await uniqRow('select * from workers order by worker_id desc limit 1')
        cb(null, (last.rows.length ? last.rows[0].worker_id : 1) + ".jpg")
    }
})
const upload = multer({ storage: storage });

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


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/public', '/index.html'))
})

app.get('/facerecog', (req, res) => {
    res.sendFile(path.join(__dirname, '/public', '/face-recog', '/index.html'))
})

app.get('/addworker', (req, res) => {
    res.sendFile(path.join(__dirname, '/public', '/pages', '/index.html'))
})

app.get('/workers', (req, res) => {
    res.sendFile(path.join(__dirname, '/public', '/pages', '/workers.html'))
})

app.post('/worker/post', async (req, res) => {
    try {
        const last = await uniqRow('select * from workers order by worker_id desc limit 1')        
        await uniqRow('insert into workers (worker_fish, worker_imgpath) values ($1,$2)', req.body.fish, (path.join(__dirname, '../', '../', 'face_images/') + (last.rows.length ? last.rows[0].worker_id+1 : 1) + "." + 'JPEG'))
        return res.json({
            status: 200,
            message: `QO'SHILDI`
        })
    } catch (error) {
        console.log(error.message, '/worker/post');
    }
})

app.post('/worker/post/img', upload.single('test'), (req, res) => {})

app.get('/workerall', async (req, res) => {
    try {
        const all = await uniqRow('select * from workers')
        
        res.json({
            all: all.rows
        })
    } catch (error) {
        console.log(error.message, '/workerall');
    }
})

app.post('/workerallfilter', async (req, res) => {
    try {
        const query = `
        select
        *,
        TO_CHAR(w.worker_getdate, 'DD-MM-YYYY')
        from workers as w
        where TO_CHAR(w.worker_getdate, 'DD-MM-YYYY') >= $1 and TO_CHAR(w.worker_getdate, 'DD-MM-YYYY') < $2;
        `
        const all = await uniqRow(query,req.body.from, req.body.to)
        
        res.json({
            all: all.rows
        })
    } catch (error) {
        console.log(error.message, '/workerall');
    }
})

app.get('/worker/get/:id/:name', async (req, res) => {
    try {
        const workers = await uniqRow('select * from workers where worker_id = $1', req.params.id)
        res.sendFile(path.join(__dirname, '../', '../', 'face_images/', `${req.params.id}.jpg`))
    } catch (error) {
        console.log(error.message, '/worker/get/:id');
    }
})

app.post('/worker/post/time', async (req, res) => {
    try {
        const today = new Date().getDate()
        const mounth = new Date().getMonth()
        const year = new Date().getFullYear()
        
        const gethours = (new Date().getHours() * 60) + (new Date().getMinutes())
        const hours = new Date().getHours() + ':' + new Date().getMinutes()
        const resultdate = `${year}-${mounth == 12 ? mounth : mounth + 1 }-${today.toString().length == 1 ? '0'+today : today}`
        const checktime = await uniqRow(`select * from settime where worker_id = $1 and to_char(settime.time_date, 'YYYY-MM-DD') = $2`, req.body.id, resultdate)
        console.log(checktime.rows);
        if (checktime.rows.length) {
            const asd = checktime.rows.find(el => el.time_check.length > 0)
            
            if((gethours - asd.time_check) <= 15){
                res.json({
                    status: 400,
                    message: '10 minut dan keyn urunib koring'
                })
            } else {
                // const checkendwork = await uniqRow('select * from settime where ')
                const asd = checktime.rows.find(el => el.time_end)
                if (!asd) {
                    await uniqRow('update settime set time_end = $1 where time_id = $2', hours, checktime.rows[0].time_id)
                    if (typeof req.body.id == 'number') {
                        const worker = await uniqRow('select * from workers where worker_id = $1', req.body.id)
                        res.json({
                            status: 200,
                            id: worker.rows[0].worker_id,
                            message: worker.rows[0].worker_fish+' shu ishchi '+ hours + ' shu soatda ishdan ketdi !'
                        })
                    }
                } else {
                    res.json({
                        status: 401,
                        message: 'bu ishchi bugun ishini kugatib bolgan'
                    })
                }
            }
        } else {
            if (typeof req.body.id == 'number') {
                await uniqRow(`insert into settime (time_get,time_check,worker_id) values ($1, $2, $3)`,hours,gethours,req.body.id)
                const worker = await uniqRow('select * from workers where worker_id = $1', req.body.id)
                res.json({
                    status: 201,
                    id: worker.rows[0].worker_id,
                    message: worker.rows[0].worker_fish+' shu ishchi '+ hours + ' shu soatda ishga keldi !'
                })
            }
        }
    } catch (error) {
        console.log(error.message, '/worker/post/time');
    }
})

app.post('/excelexport', async (req, res) => {
    try {
        
        const workers = []
        // if(req.body.from || req.body.to){
        // const query = `
        // select 
        // *
        // from settime as s
        // inner join workers as w on w.worker_id = s.worker_id
        // where w.worker_id = $1
        // `
        const query = `
        select * from workers where worker_id = $1 limit 1
        `
        for (const i of req.body.id) {
            const a = await uniqRow(query, +(i.id))
            if(a.rows.length){
                for (const i of a.rows) {
                    workers.push(i)
                }
            }
        }
        
        var Excel = require('exceljs');
        var workbook = new Excel.Workbook();
        const workbooka = new Excel.stream.xlsx.WorkbookWriter({
            filename: 'demo_hidden_columns_bug.xlsx', useStyles: true
        })
        
        // Some information about the Excel Work Book.
        workbook.creator = 'Fayzulloh Shodiyev';
        workbook.lastModifiedBy = '';
        workbook.created = new Date(2018, 6, 19);
        workbook.modified = new Date();
        workbook.lastPrinted = new Date(2016, 9, 27);
        
        var sheet = workbook.addWorksheet('LIST 1');
        const sheetarray = []
        
        for (let i = 1; i <= daysInCurrentMonth; i++) {
            sheetarray.push({
                header: `Kelish`,
                key: `income${i}`
            })
            sheetarray.push({
                header: `Ketish`,
                key: `care${i}`
            })
            sheetarray.push({
                header: `Ishlangan soat`,
                key: `time${i}`,
                width: 15, style: { numFmt: 'General' }
            })
        }        
        
        await sheetarray.unshift({ header: 'FIO', key: 'fio', width: 20, style: { numFmt: 'General' }})
        await sheetarray.unshift({ header: 'ID', key: 'id'})
        await sheetarray.push({ header: 'Oylik Vaqti', key: 'allresult', width: 11, style: { numFmt: 'General' }})
        sheet.columns = sheetarray
        
        
        const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
        let month = months[new Date().getMonth()];
        
        // const finished = workers.filter(el => el.time_date.toString().includes(`${month[0]}${month[1]}${month[2]}`))
        function getAllDaysInMonth(year, month) {
            const date = new Date(year, month, 1);
            
            const dates = [];
            
            while (date.getMonth() === month) {
                dates.push(date.getDate());
                date.setDate(date.getDate() + 1);
            }
            
            return dates;
        }
        const a = []
        for (const i of workers) {
            const workertimes = await uniqRow('select * from settime where worker_id = $1', i.worker_id)
            const getMonth = workertimes.rows.filter(el => el.time_date.toString().includes(`${month[0]}${month[1]}${month[2]}`))
            const worker = {
                id: i.worker_id,
                fio: i.worker_fish,
            }
            let count = 0
            let fullresult = 0
            for (const i of getMonth) {
                const asd = i.time_date.toString().split(' ')[2]
                const now = new Date();
                const fasd = getAllDaysInMonth(now.getFullYear(), now.getMonth())
                count += 1
                worker[`income${count}`] = i.time_get;
                worker[`care${count}`] = (isNaN(i.time_end) ? i.time_end : '');
                const time = i.time_end ? calculateTime(i.time_get, i.time_end) : '0'
                worker[`time${count}`] = time;
                const fulltime = await (time != '0' ? +(time.split(':')[0] * 60) + +(time.split(':')[1]) : 'none')
                await (fulltime != 'none' ? fullresult += fulltime : fullresult)
                
            }
            // const now = new Date();
            // const fasd = getAllDaysInMonth(now.getFullYear(), now.getMonth())
            // for (let i = 0, j = 0; i < fasd.length; i++, j++) {
            //     // console.log(getMonth[i]);
            //     const asd = (getMonth[i].time_date.toString().split(' ')[2][0] == '0' ? getMonth[i].time_date.toString().split(' ')[2][1] : getMonth[i].time_date.toString().split(' ')[2])
            //     // console.log(asd);
            //     // console.log(fasd[j]);
            //     if (fasd[j] == asd) {
            //         console.log('asd')
            //     } else {
            //         console.log('avasd');
            //     }
            // }
            console.log(worker);
            worker[`allresult`] = timeConvert(fullresult);
            a.push(worker)
        }
        
        for (const i of a) {
            sheet.addRow(i)   
        }
        
        workbook.xlsx.writeFile("Xisobot.xls")
        res.send('asd')
    } catch (error) {
        console.log(error.message, '/excelexport');
    }
})

app.get('/img/:id', (req, res)=>{
    res.sendFile(path.join(__dirname, '../', '../', 'face_images/', `${req.params.id}.jpg`))
})

app.get('/xisobot', (req, res)=>{
    res.sendFile(path.join(__dirname, '../', 'Xisobot.xls'))
})

// app.listen(443, console.log(443))
httpServer.listen(443, console.log(443))