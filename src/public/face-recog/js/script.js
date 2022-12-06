try {
    const video = document.getElementById('videoInput')
    const alert = document.querySelector('.alert')
    const alerttext = document.querySelector('.alert-text')
    
    
    Promise.all([
        faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.ssdMobilenetv1.loadFromUri('/models') //heavier/accurate version of tiny face detector
    ]).then(start)
    
    function start() {
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
            const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.7)
            
            // for nested loops
            
            video.addEventListener('play', async () => {
                const canvas = faceapi.createCanvasFromMedia(video)
                document.body.append(canvas)
                
                const displaySize = { width: video.width, height: video.height }
                faceapi.matchDimensions(canvas, displaySize)
                
                
                
                setInterval(async () => {
                    const detections = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors()
                    
                    const resizedDetections = faceapi.resizeResults(detections, displaySize)
                    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
                    
                    const results = resizedDetections.map((d) => {
                        return faceMatcher.findBestMatch(d.descriptor)
                    })
                    
                    results.forEach( async (result, i) => {
                        
                        if (results.length > 1) {
                            alert.classList.remove('display_none')
                            alert.classList.remove('alert-ok')
                            alert.classList.add('alert-no')
                            alerttext.textContent = `Kameraga faqat bir kishi qarasin ❗️`
                        } else if (results.length == 1) {
                            const res = await fetch('http://localhost:4000/worker/post/time', {
                            method: 'POST',
                            headers: {
                                'Content-type': 'application/json'
                            },
                            body: JSON.stringify({
                                id: +(result.toString().split(' ')[0])
                            })
                        })
                        const data = await res.json()
                        
                        if (data.status == 200){
                            alert.classList.add('alert-ok')
                            alerttext.textContent = 'Ketish vaqti tasdiqlandi ✅'
                        } else if (data.status == 201) {
                            alert.classList.remove('display_none')
                            alert.classList.add('alert-ok')
                            alerttext.textContent = 'Kelish vaqti tasdiqlandi ✅'
                        } else if (data.status == 400) {
                            alert.classList.remove('display_none')
                            alert.classList.remove('alert-ok')
                            alert.classList.add('alert-no')
                            alerttext.textContent = `10 daqiqadan so'ng qayta uruning ❌`
                        } else if (data.status == 401) {
                            alert.classList.remove('display_none')
                            alert.classList.remove('alert-ok')
                            alert.classList.add('alert-no')
                            alerttext.textContent = 'Bugungi ish kuni yakunlangan ❌'
                        }

                        setTimeout(() => {
                            alert.classList.add('display_none')
                        }, 3000)
                        
                        // const box = resizedDetections[i].detection.box
                        // let drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
                        // drawBox.draw(canvas)
                    }
                })
            }, 5000)
        })
    }
    
    
    async function loadLabeledImages() {
        const res = await fetch('http://localhost:4000/workerall')
        const data = await res.json()
        const labels = []
        for (const i of data.all) {
            labels.push((i.worker_id).toString())
        }
        let counter = 0
        return Promise.all(
            labels.map(async (label)=>{
                counter += 1
                const descriptions = []
                const img = await faceapi.fetchImage(`http://localhost:4000/worker/get/${counter}/${label}`)
                const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
                descriptions.push(detections.descriptor)
                return new faceapi.LabeledFaceDescriptors(label, descriptions)
            }))
        }
    } catch (error) {
        console.log(error.message);
        setTimeout(() => {
            location.reload()
        }, 2000)
    }