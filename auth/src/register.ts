import './style.css'
import { auth, db } from './firebase'
import {
    createUserWithEmailAndPassword,
    updateProfile,
    onAuthStateChanged
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'

const registerForm = document.getElementById('register-form') as HTMLFormElement
const ndidInput = document.getElementById('ndid') as HTMLInputElement
const fullnameInput = document.getElementById('fullname') as HTMLInputElement
const emailInput = document.getElementById('email') as HTMLInputElement
const passwordInput = document.getElementById('password') as HTMLInputElement
const submitBtn = document.getElementById('submit-btn') as HTMLButtonElement
const statusMsg = document.createElement('div')
statusMsg.className = 'status-msg'
document.body.appendChild(statusMsg)

function showStatus(text: string, type: 'error' | 'success') {
    statusMsg.textContent = text
    statusMsg.className = `status-msg show ${type}`
    setTimeout(() => { statusMsg.className = 'status-msg' }, 4000)
}

onAuthStateChanged(auth, (user) => {
    if (user && user.displayName) {
        window.location.href = '/'
    }
})

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault()

    const ndid = ndidInput.value.trim().toLowerCase()
    const fullname = fullnameInput.value.trim()
    const email = emailInput.value.trim()
    const password = passwordInput.value

    if (ndid.length < 3) return showStatus('NDID phải từ 3 ký tự trở lên.', 'error')

    submitBtn.disabled = true
    submitBtn.innerHTML = `<span>Đang khởi tạo NDID...</span>`

    try {
        const ndidDoc = doc(db, 'ndids', ndid)
        const ndidSnap = await getDoc(ndidDoc)

        if (ndidSnap.exists()) {
            showStatus('NDID này đã có người sử dụng.', 'error')
            submitBtn.disabled = false
            submitBtn.innerHTML = `<span>Tạo tài khoản</span>`
            return
        }

        // UPDATED: Use @ndlabs.com
        const internalEmail = `${ndid}@ndlabs.com`
        const userCredential = await createUserWithEmailAndPassword(auth, internalEmail, password)
        const user = userCredential.user

        await updateProfile(user, { displayName: fullname })

        await setDoc(doc(db, 'ndids', ndid), {
            uid: user.uid,
            recoveryEmail: email
        })

        await setDoc(doc(db, 'users', user.uid), {
            ndid: ndid,
            fullname: fullname,
            emails: [email],
            createdAt: new Date().toISOString()
        })

        localStorage.setItem('nd_user', JSON.stringify({
            displayName: fullname,
            email: email,
            uid: user.uid,
            ndid: ndid
        }));

        showStatus('Tạo NDID thành công!', 'success')
        setTimeout(() => { window.location.href = '/' }, 1200)

    } catch (error: any) {
        console.error(error)
        showStatus('Lỗi: ' + (error.code || error.message), 'error')
        submitBtn.disabled = false
        submitBtn.innerHTML = `<span>Tạo tài khoản</span>`
    }
})
