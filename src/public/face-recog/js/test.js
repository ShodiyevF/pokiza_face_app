try {
    
    const a = document.querySelector('.a')
    const b = document.querySelector('.b')
    const button = document.querySelector('.ads')
    const content = document.querySelector('.asd')
    const alert = document.querySelector('.alert')
    const alerttext = document.querySelector('.alert-text')
    
    Promise.all([
        faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceExpressionNet.loadFromUri('/models')
    ]).then(start)
    
    async function start() {
        
        document.body.append('Models Loaded')
        
        navigator.getUserMedia(
            { video:{} },
            stream => video.srcObject = stream,
            err => console.error(err)
            )
            
            recognizeFaces()
        }
        
        async function recognizeFaces() {
            
            const labeledDescriptors = await loadLabeledImages()
            const fullresults = labeledDescriptors.filter(el => typeof el !== 'undefined')
            const faceMatcher = new faceapi.FaceMatcher(fullresults, 0.7)
            var video = await document.getElementById('video');
            
            
            const caanvas = faceapi.createCanvasFromMedia(video)
            console.log(video);
            document.body.append(caanvas)
            const displaySize = { width: video.width, height: video.height }
            faceapi.matchDimensions(caanvas, displaySize)
            let checker = true
            setInterval(async () => {
                const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks()
                const resizedDetections = faceapi.resizeResults(detections, displaySize)
                
                if (resizedDetections.length) {
                    if (checker) {
                        console.log('asdavzxc');
                        var canvas = document.getElementById('canvas');
                        var context = canvas.getContext('2d');
                        var a = document.querySelector('img');
                        let image
                        
                        document.getElementById("snap").click()
                        document.getElementById("snap").addEventListener("click", async function (e) {
                            checker = false
                            
                            console.log(e);
                            context.drawImage(video, 0, 0, 640, 480)
                            const d = canvas.toDataURL();
                            a.src = d;
                            await (image = a)
                            
                            const displaySize = await { width: image.width, height: image.height }    
                            
                            faceapi.matchDimensions(canvas, displaySize)
                            console.log('asd1');
                            
                            const detections = await faceapi.detectAllFaces(image).withFaceExpressions()

                            console.log(detections);
                            console.log('asd2');
                            const resizedDetections = faceapi.resizeResults(detections, displaySize)
                            console.log(resizedDetections);
                            console.log('asd3');
                            const results = resizedDetections.map((d) => {
                                return faceMatcher.findBestMatch(d.descriptor)
                            })
                            
                            console.log(results)
                            
                            if(results.length == 0){
                                alert.classList.remove('display_none')
                                alert.classList.remove('alert-ok')
                                alert.classList.add('alert-no')
                                alerttext.textContent = `Hech kim yoq ❔ `
                                setTimeout(() => {
                                    alert.classList.add('display_none')
                                }, 3000)
                            } else {
                                results.forEach( async (result, i) => {
                                    if(results[0]._label == 'unknown'){
                                        alert.classList.remove('display_none')
                                        alert.classList.remove('alert-ok')
                                        alert.classList.add('alert-no')
                                        alerttext.textContent = `Bu ishchi bazadan topilmadi ❗️ `
                                    } else if (results.length > 1) {
                                        alert.classList.remove('display_none')
                                        alert.classList.remove('alert-ok')
                                        alert.classList.add('alert-no')
                                        alerttext.textContent = `Kameraga faqat bir kishi qarasin ❗️`
                                    } else if (results.length == 1) {
                                        const res = await fetch('/worker/post/time', {
                                            method: 'POST',
                                            headers: {
                                                'Content-type': 'application/json'
                                            },
                                            body: JSON.stringify({
                                                id: +(result.toString().split(' ')[0])
                                            })
                                        })
                                        const data = await res.json()
                                        console.log(data)
                                        if (data.status == 200){
                                            checker = true
                                            alert.classList.add('alert-ok')
                                            alert.classList.remove('alert-no')
                                            alerttext.textContent = 'Ketish vaqti tasdiqlandi ✅'
                                        } else if (data.status == 201) {
                                            checker = true
                                            alert.classList.remove('display_none')
                                            alert.classList.remove('alert-no')
                                            alert.classList.add('alert-ok')
                                            alerttext.textContent = 'Kelish vaqti tasdiqlandi ✅'
                                        } else if (data.status == 400) {
                                            checker = true
                                            alert.classList.remove('display_none')
                                            alert.classList.remove('alert-ok')
                                            alert.classList.add('alert-no')
                                            alerttext.textContent = `15 daqiqadan so'ng qayta uruning ❌`
                                        } else if (data.status == 401) {
                                            checker = true
                                            alert.classList.remove('display_none')
                                            alert.classList.remove('alert-ok')
                                            alert.classList.add('alert-no')
                                            alerttext.textContent = 'Bugungi ish kuni yakunlangan ❌'
                                        }
                                        checker = true
                                        setTimeout(() => {
                                            alert.classList.add('display_none')
                                        }, 3000)
                                    }
                                })
                            }setInterval(() => {
                                
                            }, );
                        })
                    } else {
                        console.log('hali tugamadi')
                    }
                } else {
                    console.log('hech kim yoq');
                }
            }, 5000)
            
        }
        
        async function loadLabeledImages() {
            const res = await fetch('/workerall')
            const data = await res.json()
            const labels = []
            for (const i of data.all) {
                labels.push((i.worker_id).toString())
            }
            let counter = 0
            return Promise.all(
                labels.map(async label => {
                    counter += 1
                    const descriptions = []
                    const img = await faceapi.fetchImage(`/worker/get/${counter}/${label}`)
                    const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
                    if (typeof detections !== 'undefined') {
                        descriptions.push(detections.descriptor)
                        return new faceapi.LabeledFaceDescriptors(label, descriptions)
                    }
                    console.log(descriptions)
                }))
            }
        } catch(err) {
            console.log(err.message)
        }