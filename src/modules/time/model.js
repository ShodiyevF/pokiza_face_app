const { calculateTime, timeConvert } = require('../../lib/calctime')
const { daysInCurrentMonth } = require('../../lib/getday')
const { uniqRow } = require('../../lib/pg')

const excelExportModel = async ( {id} ) => {
    try {
        console.log(id);
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
            console.log(worker);
            worker[`allresult`] = timeConvert(fullresult);
            a.push(worker)
        }
        
        for (const i of a) {
            sheet.addRow(i)   
        }
        
        workbook.xlsx.writeFile("Xisobot.xls")
    } catch (error) {
        console.log(error.message, 'excelExportModel')
    }
}

module.exports = {
    excelExportModel
}