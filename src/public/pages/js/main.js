try {
    
    const text = document.querySelector('.text')
    const btn = document.querySelector('.button')
    const imgform = document.querySelector('.test')
    const filea = document.querySelector('.file')
    
    
    btn.onclick = () => {
        text.style.borderColor = '#97AFCB'
        filea.style.borderColor = '#97AFCB'
        const reader = new FileReader();
        
        
        const _URL = window.URL || window.webkitURL;
        // document.querySelector('#image-input').addEventListener('change',function (e) {
        let file, img;
        if ((file = filea.files[0])) {
            img = new Image();
            const objectUrl = _URL.createObjectURL(file);
            img.onload = function () {
                const filetype = filea.value.split('.')[filea.value.split('.').length - 1]
                if(img.width > 600 && img.width > 600 ){
                    return alert(`rasmni eni va boyi 600 dan kichik bo'lishi kerak`)
                } else if (!(text.value)) {
                    text.style.borderColor = 'red'
                } else if (!(filea.value)) {
                    filea.style.borderColor = 'red'
                } else if (filetype != 'jpg' || filetype != 'JPEG' || filetype != 'JPG' || filetype != 'jpeg') {
                    alert('Iltimos rasming turini jpg qiling !')
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
                                const formData = new FormData()
                                formData.append("file", filea.files[0]);
                                const res = await fetch('/worker/post/image',{
                                    method: 'POST',
                                    body: formData
                                })
                                const data = await res.json()
                                filea.value = ''
                                console.log(data)
                            })()
                            setTimeout(() => {
                                window.location = '/'
                            }, 2000)
                            text.value = ''
                        }
                    })()
                }
                _URL.revokeObjectURL(objectUrl);
            };
            img.src = objectUrl;
        }
    }
} catch (error) {
    
}