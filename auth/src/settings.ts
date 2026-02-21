import './style.css'
import { auth, db, storage } from './firebase'
import {
    onAuthStateChanged,
    updateProfile,
    signOut,
    linkWithPopup,
    GoogleAuthProvider,
    reauthenticateWithCredential,
    EmailAuthProvider
} from 'firebase/auth'
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

const userAvatar = document.getElementById('user-avatar') as HTMLImageElement
const avatarUpload = document.getElementById('avatar-upload') as HTMLInputElement
const displayName = document.getElementById('display-name') as HTMLHeadingElement
const displayEmail = document.getElementById('display-email') as HTMLParagraphElement
const ndidDisplay = document.getElementById('ndid-display') as HTMLSpanElement
const editNameInput = document.getElementById('edit-name') as HTMLInputElement
const profileForm = document.getElementById('profile-form') as HTMLFormElement
const linkGoogleBtn = document.getElementById('link-google-btn') as HTMLButtonElement
const logoutBtn = document.getElementById('logout-btn') as HTMLButtonElement

const reauthModal = document.getElementById('reauth-modal') as HTMLDivElement
const reauthPassword = document.getElementById('reauth-password') as HTMLInputElement
const confirmReauth = document.getElementById('confirm-reauth') as HTMLButtonElement
const cancelReauth = document.getElementById('cancel-reauth') as HTMLButtonElement

let currentUser: any = null

const statusMsg = document.createElement('div')
statusMsg.className = 'status-msg'
document.body.appendChild(statusMsg)

function showStatus(text: string, type: 'error' | 'success') {
    statusMsg.textContent = text
    statusMsg.className = `status-msg show ${type}`
    setTimeout(() => { statusMsg.className = 'status-msg' }, 4000)
}

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        localStorage.removeItem('nd_user')
        window.location.href = '/auth/login/'
        return
    }

    currentUser = user
    displayName.textContent = user.displayName || 'ND Member'

    const userSnap = await getDoc(doc(db, 'users', user.uid))
    if (userSnap.exists()) {
        const data = userSnap.data()
        displayEmail.textContent = data['emails']?.[0] || user.email
        ndidDisplay.textContent = data['ndid'] || user.email?.split('@')[0] || ''
        editNameInput.value = data['fullname'] || user.displayName || ''
    } else {
        // Fallback for accounts created before Firestore integration
        ndidDisplay.textContent = user.email?.split('@')[0] || ''
        displayEmail.textContent = user.email || ''
        editNameInput.value = user.displayName || ''
    }

    if (user.photoURL) userAvatar.src = user.photoURL

    const isGoogleLinked = user.providerData.some((p: any) => p.providerId === 'google.com')
    if (isGoogleLinked) {
        linkGoogleBtn.textContent = 'Đã liên kết Google'
        linkGoogleBtn.disabled = true
    }

    // Update localStorage
    const stored = localStorage.getItem('nd_user')
    const storedParsed = stored ? JSON.parse(stored) : {}
    localStorage.setItem('nd_user', JSON.stringify({
        ...storedParsed,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        uid: user.uid,
    }))
})

avatarUpload.addEventListener('change', async (e: any) => {
    const file = e.target.files[0]
    if (!file || !currentUser) return
    try {
        const storageRef = ref(storage, `avatars/${currentUser.uid}`)
        await uploadBytes(storageRef, file)
        const url = await getDownloadURL(storageRef)
        await updateProfile(currentUser, { photoURL: url })
        userAvatar.src = url
        await updateDoc(doc(db, 'users', currentUser.uid), { photoURL: url })
        showStatus('Cập nhật ảnh đại diện thành công!', 'success')
    } catch (error) {
        console.error(error)
        showStatus('Lỗi khi tải ảnh lên.', 'error')
    }
})

profileForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    if (!currentUser) return
    try {
        const newName = editNameInput.value.trim()
        await updateProfile(currentUser, { displayName: newName })
        try {
            await updateDoc(doc(db, 'users', currentUser.uid), { fullname: newName })
        } catch (_) { /* no doc yet, ignore */ }
        displayName.textContent = newName
        showStatus('Cập nhật thành công!', 'success')
    } catch (error) {
        showStatus('Lỗi khi lưu thông tin.', 'error')
    }
})

linkGoogleBtn.addEventListener('click', () => {
    reauthModal.classList.remove('hidden')
})

cancelReauth.addEventListener('click', () => {
    reauthModal.classList.add('hidden')
})

confirmReauth.addEventListener('click', async () => {
    const password = reauthPassword.value
    if (!password || !currentUser) return
    const credential = EmailAuthProvider.credential(currentUser.email!, password)
    try {
        await reauthenticateWithCredential(currentUser, credential)
        reauthModal.classList.add('hidden')
        const provider = new GoogleAuthProvider()
        const result = await linkWithPopup(currentUser, provider)
        linkGoogleBtn.textContent = 'Đã liên kết Google'
        linkGoogleBtn.disabled = true
        // Save Google email to recovery list
        const googleEmail = result.user.providerData.find((p: any) => p.providerId === 'google.com')?.email
        if (googleEmail) {
            try {
                await updateDoc(doc(db, 'users', currentUser.uid), { emails: arrayUnion(googleEmail) })
            } catch (_) { /* ignore if no doc */ }
        }
        showStatus('Liên kết Google thành công!', 'success')
    } catch (error: any) {
        showStatus('Lỗi: ' + error.message, 'error')
    }
})

logoutBtn.addEventListener('click', async () => {
    await signOut(auth)
    localStorage.removeItem('nd_user')
    window.location.href = '/'
})
