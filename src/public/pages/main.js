try {
    
    const text = document.querySelector('.text')
    const btn = document.querySelector('.button')
    const imgform = document.querySelector('.test')
    const filea = document.querySelector('.file')
    
    
    btn.onclick = () => {
        text.style.borderColor = '#97AFCB'
        filea.style.borderColor = '#97AFCB'
        const filetype = filea.value.split('.')[filea.value.split('.').length - 1]
        if (!(text.value)) {
            text.style.borderColor = 'red'
        } else if (!(filea.value)) {
            filea.style.borderColor = 'red'
        } else if (filetype != 'jpg' && filetype != 'JPEG') {
            filea.style.borderColor = 'red'
        } else {
            (async () => {
                const res = await fetch('/worker/post', {
                    method: 'POST',
                    headers: {
                        'Content-type': 'application/json'
                    },
                    body: JSON.stringify({
                        fish: text.value
                    })
                })
                const data = await res.json()
                if(data.status == 200){
                    (async () => {
                        const filea = document.querySelector('.file')
                        const formData = new FormData();
                        formData.append("test", filea.files[0]);
                        filea.value = ''
                        
                        const res = await fetch('/worker/post/img',{
                            method: 'POST',
                            body: formData})
                            const data = await res.json()
                        })()
                        setTimeout(() => {
                            window.location = '/'
                        }, 2000)
                        text.value = ''
                    }})()
                }
            }
        } catch (error) {
            
        }