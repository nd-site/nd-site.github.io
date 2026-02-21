import './style.css'
import { auth } from './firebase'
import {
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged
} from 'firebase/auth'

const loginForm = document.getElementById('login-form') as HTMLFormElement
const ndidInput = document.getElementById('ndid') as HTMLInputElement
const passwordInput = document.getElementById('password') as HTMLInputElement
const submitBtn = document.getElementById('submit-btn') as HTMLButtonElement
const googleBtn = document.getElementById('google-btn') as HTMLButtonElement
const statusMsg = document.createElement('div')
statusMsg.className = 'status-msg'
document.body.appendChild(statusMsg)

function showStatus(text: string, type: 'error' | 'success') {
    statusMsg.textContent = text
    statusMsg.className = `status-msg show ${type}`
    setTimeout(() => { statusMsg.className = 'status-msg' }, 4000)
}

function syncSession(user: any, ndid: string) {
    localStorage.setItem('nd_user', JSON.stringify({
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        uid: user.uid,
        ndid: ndid
    }));
}

// Check logged in
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const stored = localStorage.getItem('nd_user');
        if (!stored) {
            syncSession(user, user.email?.split('@')[0] || '');
        }
        window.location.href = '/';
    }
})

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault()

    const rawNdid = ndidInput.value.trim().toLowerCase()
    const password = passwordInput.value

    if (!rawNdid || !password) return

    submitBtn.disabled = true
    submitBtn.innerHTML = `<span>Đang xác thực...</span>`

    try {
        // UPDATED: Standardized to use @ndlabs.com as per user's working input
        const internalEmail = rawNdid.includes('@') ? rawNdid : `${rawNdid}@ndlabs.com`
        const userCredential = await signInWithEmailAndPassword(auth, internalEmail, password)

        syncSession(userCredential.user, rawNdid);
        showStatus('Đăng nhập thành công!', 'success')
        setTimeout(() => { window.location.href = '/' }, 800)
    } catch (error: any) {
        console.error(error)
        showStatus('NDID hoặc mật khẩu không chính xác.', 'error')
    } finally {
        submitBtn.disabled = false
        submitBtn.innerHTML = `<span>Đăng nhập</span><i class="ph-bold ph-arrow-right"></i>`
    }
})

googleBtn.addEventListener('click', async () => {
    const provider = new GoogleAuthProvider()
    try {
        const result = await signInWithPopup(auth, provider)
        const ndid = result.user.email?.split('@')[0].toLowerCase() || 'member'
        syncSession(result.user, ndid);
        window.location.href = '/'
    } catch (error) {
        showStatus('Lỗi khi kết nối với Google.', 'error')
    }
})
