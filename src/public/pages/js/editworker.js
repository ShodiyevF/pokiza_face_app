const id = document.querySelector('.id')
const fish = document.querySelector('.fish')
const send_btn = document.querySelector('.send_btn')
const check = document.querySelector('.check')
const filea = document.querySelector('.file')

send_btn.onclick = async (e) => {
    id.style.borderColor = 'rgb(118, 118, 118)'
    fish.style.borderColor = 'rgb(118, 118, 118)'
    filea.style.borderColor = 'black'
    
    if (!(id.value) || isNaN(+(id.value))) {
        id.style.borderColor = 'red'
    } else if(!(fish.value)){
        fish.style.borderColor = 'red'
    } else {
        const res = await fetch('/workerput', {
            method: 'PUT',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                id: id.value,
                fish: fish.value
            })
        })
        
        const data = await res.json()
        if(check.checked){
            if (data.status == 200) {
                alert(`Tahrirlandi`)
                setTimeout(() => {
                    window.location = '/workers'
                }, 2000)
            } else if(data.status == 404) {
                alert(`ishchi topilmadi`)
                id.value = ''
            } else {
                alert(`Tahrirlanmadi`)
            }
            if (filea.files[0]) {
                const formData = new FormData();
                formData.append("testa", filea.files[0]);
                filea.value = ''
                const res = await fetch(`/worker/put/img/${+(id.value)}`,{
                    method: 'PUT',
                    body: formData
                })
                const dataa = await res.json()                
            } else {
                alert('Rasm tanlab keyn bosing')
            }
        } else {
            if (data.status == 200) {
                alert(`Tahrirlandi`)
                window.location = '/workers'
            } else if(data.status == 404) {
                alert(`ishchi topilmadi`)
                id.value = ''
            } else {
                alert(`Tahrirlanmadi`)
            }
        }
        
    }
}