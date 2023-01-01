const id = document.querySelector('.id')
const fish = document.querySelector('.fish')
const send_btn = document.querySelector('.send_btn')
// const check = document.querySelector('.check')
const filea = document.querySelector('.file')
const mini_wrapper = document.querySelector('.mini_wrapper')

send_btn.onclick = async (e) => {
    id.style.borderColor = 'rgb(118, 118, 118)'
    fish.style.borderColor = 'rgb(118, 118, 118)'
    mini_wrapper.style.borderColor = 'black'
    if (!(id.value) || isNaN(+(id.value))) {
        id.style.borderColor = 'red'
    } else {
        if (fish.value) {
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
        }
        
        let checker = true
        if (filea.files[0]) {
            const formData = new FormData();
            formData.append("id", id.value);
            if ((filea.files[0]).type == 'image/jpeg') {
                checker = true
                formData.append("file", filea.files[0]);
                const res = await fetch(`/workerputimage`,{
                    method: 'PUT',
                    body: formData
                })
            } else {
                checker = false
                alert(`Rasmning turi jpg bo'lsin iltimos !`)
            }
        }
        
        
        if (filea.files.length == 0 && !(fish.value)) {
            alert('Nimani tahrirlayotganingizni yozing !')
            fish.style.borderColor = 'red'
            mini_wrapper.style.borderColor = 'red'
        } else {
            filea.value = ''
            if (checker) {
                filea.value = ''
                id.value = ''
                fish.value = ''
                alert('Tahrirlandi !')
                setTimeout(() => {
                    window.location = '/workers'
                }, 1000)
            }
            
        }
    }
}