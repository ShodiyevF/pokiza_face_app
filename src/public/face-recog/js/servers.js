let videoo = document.querySelector("#video");
let click_button = document.querySelector("#snap");
let canvas = document.querySelector("#canvas");
const alert = document.querySelector('.alert');
const alerttext = document.querySelector('.alert-text');

function count_duplicate(a){
	let counts = {}
	
	for(let i =0; i < a.length; i++){ 
		if (counts[a[i]]){
			counts[a[i]] += 1
		} else {
			counts[a[i]] = 1
		}
	}
	return counts
}

function alerton(action, text){
	alert.classList.remove('display_none')
	alert.classList.remove(action == 1 ? 'alert-no' : 'alert-ok')
	alert.classList.add(action == 1 ? 'alert-ok' : 'alert-no')
	alerttext.textContent = text
	setTimeout(() => {
		alert.classList.add('display_none')
	}, 2000)
}

function dataURItoBlob(dataURI) {
	var byteString = atob(dataURI.split(',')[1]);
	var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
	var ab = new ArrayBuffer(byteString.length);
	var ia = new Uint8Array(ab);
	for (var i = 0; i < byteString.length; i++) {
		ia[i] = byteString.charCodeAt(i);
	}
	var blob = new Blob([ab], {type: mimeString});
	return blob;
	
}



let checker = true
click_button.addEventListener('click', async function() {
	if (checker) {
		checker = false

		const start = new Date().getTime() / 1000;

		const results = []
		
		canvas.getContext('2d').drawImage(videoo, 0, 0, canvas.width, canvas.height);
		const a = canvas.toDataURL('image/jpeg');	
		var blob = dataURItoBlob(a);
		var fd = new FormData();
		fd.append('file', blob, 'test.jpg');
		const res = await fetch('/facerecognation',{
			method: 'post',
			body: fd
		});
		const data = await res.json()
		let data2
		console.log(data);
		
		results.push(data.data.length ? data.data[0]._label : 'none')
		
		setTimeout(async () => {
			canvas.getContext('2d').drawImage(videoo, 0, 0, canvas.width, canvas.height);
			const a = canvas.toDataURL('image/jpeg');	
			var blob = dataURItoBlob(a);
			var fd = new FormData();
			fd.append('file', blob, 'test.jpg');
			const res = await fetch('/facerecognation',{
				method: 'post',
				body: fd
			});
			data2 = await res.json()
			
			results.push(data2.data.length ? data2.data[0]._label : 'none')
		}, 2000)
		
		setTimeout(async () => {
			canvas.getContext('2d').drawImage(videoo, 0, 0, canvas.width, canvas.height);
			const a = canvas.toDataURL('image/jpeg');	
			var blob = dataURItoBlob(a);
			var fd = new FormData();
			fd.append('file', blob, 'test.jpg');
			const res = await fetch('/facerecognation',{
				method: 'post',
				body: fd
			});
			const data3 = await res.json()
			
			results.push(data3.data.length ? data3.data[0]._label : 'none')
			const result = Object.keys(count_duplicate(results))
			
			console.log(result)
			if (result == 'none') {
				alerton(0, 'Hech kim yoq ❔')
				checker = true
			} else if (result.length > 1){
				alerton(0, 'Cameraga yaxshiroq qarang ❗️')
				checker = true
			} else if (result == 'unknown' || result == 1000000){
				alerton(0, 'Bu ishchi bazadan topilmadi ❗️')
				checker = true
			} else if (data.data.length > 1 || data2.data.length > 1 || data3.data.length > 1){
				alerton(0, 'Kameraga faqat bir kishi qarasin ❗️')
				checker = true
			} else {
				const res = await fetch('/worker/post/time', {
					method: 'POST',
					headers: {
						'Content-type': 'application/json'
					},
					body: JSON.stringify({
						id: +result
					})
				})
				const data = await res.json()
				if (data.status == 200){
					alerton(1, 'Ketish vaqti tasdiqlandi ✅')
				} else if (data.status == 201) {
					alerton(1, 'Kelish vaqti tasdiqlandi ✅')
				} else if (data.status == 400) {
					alerton(0, `15 daqiqadan so'ng qayta uruning ❌`)
				} else if (data.status == 401) {
					alerton(0, `Bugungi ish kuni yakunlangan ❌`)
				}
				const audio = new Audio();
				audio.src ='/test';
				audio.play();
				checkerr = true
			}
			checker = true
			const end = new Date().getTime() / 1000;
			console.log(end - start)
		}, 3000)
	} else {
		alerton(0, 'Amaliyot bajarilyapti biroz kuting ❗️')
	}
});