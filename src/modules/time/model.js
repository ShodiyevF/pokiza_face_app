const { calculateTime, timeConvert } = require('../../lib/calctime')
const { daysInCurrentMonth } = require('../../lib/getday')
const { uniqRow } = require('../../lib/pg')
const fs = require('fs')
const path = require('path')
const canvas = require('canvas')
const faceapi = require("@vladmandic/face-api/dist/face-api.node.js");
const tf = require('@tensorflow/tfjs-node');
// const faceapi = require('../dist/face-api.node.js'); /

const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });


async function image(img) {
    const buffer = fs.readFileSync(img);
    const decoded = tf.node.decodeImage(buffer);
    const casted = decoded.toFloat();
    const result = casted.expandDims(0);
    decoded.dispose();
    casted.dispose();
    return result;
}

function days(date1, date2) {
    date1 = date1.split('-');
    date2 = date2.split('-');
    date1 = new Date(date1[2], date1[1],date1[0]);
    date2 = new Date(date2[2], date2[1],date2[0]);
    date1_unixtime = parseInt(date1.getTime() / 1000);
    date2_unixtime = parseInt(date2.getTime() / 1000);
    var timeDifference = date2_unixtime - date1_unixtime;
    var timeDifferenceInHours = timeDifference / 60 / 60;
    var timeDifferenceInDays = timeDifferenceInHours  / 24;
    return timeDifferenceInDays
}

async function loadLabeledImages() {
    const labels = await uniqRow('select * from workers order by worker_id asc')
    return Promise.all(labels.rows.map(async label => {
        const descriptions = []
        console.log((+label.worker_id))
        const asd = await image(path.join(__dirname, '../','../','../','../','face_images/', label.worker_id.toString()+'.jpg'))
        const detections = await faceapi.detectSingleFace(asd).withFaceLandmarks().withFaceDescriptor()
        descriptions.push(detections.descriptor)
        return new faceapi.LabeledFaceDescriptors((label.worker_id).toString(), descriptions)
    }))
}

const arr = []
setTimeout(async () => {
    const res = await loadLabeledImages()
    for (const i of res) {
        arr.push(i)
    }
    console.log(arr)
}, 5000)


// (async () => {
//     setTimeout(async () => {
//         const a = await loadLabeledImages()
//         for (const i of a) {
//             // console.log(i);
//             labeledImages.push(i)
//             // await uniqRow('insert into')
//         }
//     }, 5000)
// })()


const excelExportModel = async ( {from, to, id} ) => {
    try {
        
        const workers = []
        const query = `
        select * from workers where worker_id = $1 limit 1
        `
        for (const i of id) {
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
        
        workbook.creator = 'Fayzulloh Shodiyev';
        workbook.lastModifiedBy = '';
        workbook.created = new Date(2018, 6, 19);
        workbook.modified = new Date();
        workbook.lastPrinted = new Date(2016, 9, 27);
        
        var sheet = workbook.addWorksheet('LIST 1');
        const sheetarray = []
        
        console.log(days(from, to));
        for (let i = 0; i <= days(from, to); i++) {
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
        const a = []
        for (const i of workers) {
            const query = `
            select
            *,
            split_part(w.worker_getdate::TEXT,'T', 1) as tochar,
            split_part(st.time_date::TEXT,'T', 1) as time_date
            from settime as st
            inner join workers as w on w.worker_id = st.worker_id
            where w.worker_id = $1 
            `
            // and split_part(w.worker_getdate::TEXT,'T', 1) >= $2 and split_part(w.worker_getdate::TEXT,'T', 1) <= $3;
            const fro = `${from.split('-')[2]}-${(from.split('-')[1]).length == 1 ? '0'+from.split('-')[1] : from.split('-')[1]}-${(from.split('-')[0]).length == 1 ? '0'+from.split('-')[0] : from.split('-')[0]}`
            const too = `${to.split('-')[2]}-${(to.split('-')[1]).length == 1 ? '0'+to.split('-')[1] : to.split('-')[1]}-${(to.split('-')[0]).length == 1 ? '0'+to.split('-')[0] : to.split('-')[0]}`
            const workertimes = await uniqRow(query, i.worker_id)
            console.log(fro);
            console.log(too);
            const getMontha = workertimes.rows.filter(el => el.time_date)
            console.log(getMontha);
            const getMonth = workertimes.rows.filter(el => el.time_date >= fro && el.time_date <= too)
            console.log(getMonth);
            const worker = {
                id: i.worker_id,
                fio: i.worker_fish,
            }
            let count = 0
            let fullresult = 0
            function dateRange(startDate, endDate, steps = 1) {
                const dateArray = [];
                let currentDate = new Date(startDate);
                
                while (currentDate <= new Date(endDate)) {
                    dateArray.push(new Date(currentDate));
                    currentDate.setUTCDate(currentDate.getUTCDate() + steps);
                }

                const result = []
                for (const i of dateArray) {
                    result.push(i.toISOString().split("T")[0])
                }
                return result;
            }
            
            const dates = dateRange(fro, too);
            
            
            let counter = 0
            for (const i of dates) {

                const a = getMonth.find(el => el.time_date == i)
                if(!a){
                    worker[`income${counter}`] = '';
                    worker[`care${counter}`] = ''
                    worker[`time${counter}`] = ''
                } else {
                    worker[`income${counter}`] = a.time_get;
                    worker[`care${counter}`] = (isNaN(a.time_end) ? a.time_end : '');
                    const time = a.time_end ? calculateTime(a.time_get, a.time_end) : '0'
                    worker[`time${counter}`] = time;
                    const fulltime = await (time != '0' ? +(time.split(':')[0] * 60) + +(time.split(':')[1]) : 'none')
                    await (fulltime != 'none' ? fullresult += fulltime : fullresult)
                }
                counter += 1
            }
            
            worker[`allresult`] = timeConvert(fullresult);
            a.push(worker)
        }
        for (const i of a) {
            sheet.addRow(i)
        }
        // console.log(a)
        
        workbook.xlsx.writeFile("Xisobot.xls")
    } catch (error) {
        console.log(error.message, 'excelExportModel')
    }
}

const faceRecognitionModel = async (file) => {
    try {
        const labeledDescriptors = arr
        const fullresults = labeledDescriptors.filter(el => typeof el !== 'undefined')
        const faceMatcher = new faceapi.FaceMatcher(fullresults, 0.7)
        // const das = await faceapi.fetchImage(file.data)
        // console.log(file.data);
        const canvasImg = await canvas.loadImage(file.data);
        const out = await faceapi.createCanvasFromMedia(canvasImg);
        const display = { width: out.width, height: out.height}
        const detections = await faceapi.detectAllFaces(out).withFaceLandmarks().withFaceDescriptors()
        // const displaySize = { width: detections[0].detection._imageDims._width, height: detections[0].detection._imageDims._height }
        faceapi.matchDimensions(out, display)
        const resizedDetections = faceapi.resizeResults(detections, display)
        const results = resizedDetections.map((d) => {
            return faceMatcher.findBestMatch(d.descriptor)
        })
        return results
    } catch (error) {
        console.log(error, 'faceRecognitionModel')
    }
}

module.exports = {
    excelExportModel,
    faceRecognitionModel
}