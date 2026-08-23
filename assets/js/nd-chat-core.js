/**
 * ND Labs — Unified Realtime Chat Core (Bộ lõi Trò chuyện Toàn cục dùng chung)
 * Dùng chung cho ChatND (/chat/) và Mini World Game (/games/miniworld.html)
 */

(function () {
    // Flag check
    if (window.NDChatCore) return;

    const ADMIN_CODE_ID = '00000000';
    const ADMIN_EMAIL = 'nhatdang10.nd@gmail.com';
    const ADMIN_NDID = 'nhatdang';

    // File type categorizer
    function getFileCategory(mimeType, fileName) {
        if (!mimeType) mimeType = '';
        if (!fileName) fileName = '';
        const lowerName = fileName.toLowerCase();

        if (mimeType.startsWith('image/') || /\.(png|jpe?g|gif|webp|svg|bmp)$/i.test(lowerName)) {
            return 'image';
        }
        if (mimeType.startsWith('video/') || /\.(mp4|webm|mov|avi|mkv)$/i.test(lowerName)) {
            return 'video';
        }
        if (mimeType.startsWith('audio/') || /\.(mp3|wav|ogg|m4a|aac)$/i.test(lowerName)) {
            return 'audio';
        }
        return 'document';
    }

    // Forward notification to Admin email in background
    async function notifyAdminEmail(senderInfo, messageText, fileMeta) {
        try {
            console.log(`📩 [Realtime Notification -> ${ADMIN_EMAIL}]:`, {
                sender: senderInfo,
                text: messageText,
                file: fileMeta,
                sentAt: new Date().toISOString()
            });

            // Call internal endpoint or log for automated relay
            if (window.sendEmailNotification) {
                await window.sendEmailNotification({
                    to: ADMIN_EMAIL,
                    subject: `[ChatND] Tin nhắn mới từ ${senderInfo.name || senderInfo.ndid || 'Người dùng'}`,
                    body: `Bạn vừa nhận được tin nhắn từ ${senderInfo.name} (${senderInfo.ndid} - CodeID: ${senderInfo.codeId}):\n\n"${messageText}"\n\nXem ngay tại: https://ndsite.web.app/chat?${senderInfo.ndid}`
                });
            }
        } catch (e) {
            console.warn("Could not notify admin email:", e);
        }
    }

    // Core Chat API
    const NDChatCore = {
        ADMIN_CODE_ID,
        ADMIN_EMAIL,
        ADMIN_NDID,

        getFileCategory,

        // Check if user has permission to join / view room
        canAccessGroup(room, userUid, userCodeId, isAdmin) {
            if (isAdmin) return { allowed: true, role: 'admin' };
            if (!room) return { allowed: false, reason: 'Room not found' };

            const members = room.members || {};
            const userMember = members[userUid] || (userCodeId && members[userCodeId]);

            if (userMember) {
                return { allowed: true, role: userMember.role || 'member' };
            }

            if (room.isPublic && !room.requireApproval) {
                return { allowed: false, needJoin: true, autoJoin: true };
            }

            return { allowed: false, needJoin: true, needApproval: !!room.requireApproval };
        },

        // Format File Size
        formatBytes(bytes, decimals = 1) {
            if (!bytes || bytes === 0) return '0 B';
            const k = 1024;
            const dm = decimals < 0 ? 0 : decimals;
            const sizes = ['B', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
        },

        // Upload attachment helper
        async uploadAttachment(file, uid) {
            if (!file) return null;
            const category = getFileCategory(file.type, file.name);
            let fileUrl = '';

            if (window.uploadToCloudflare) {
                try {
                    fileUrl = await window.uploadToCloudflare(file, { folder: 'chat_attachments', uid });
                } catch (e) {
                    console.warn("Cloudflare upload failed, trying fallback:", e);
                }
            }

            if (!fileUrl) {
                // Fallback to data URL for small files or Firebase Storage
                fileUrl = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target.result);
                    reader.readAsDataURL(file);
                });
            }

            return {
                url: fileUrl,
                name: file.name,
                size: file.size,
                sizeFormatted: NDChatCore.formatBytes(file.size),
                type: file.type,
                category: category
            };
        },

        // Send Direct Message
        async sendDirectMessage(db, currentSender, targetContact, messageText, attachmentFile = null) {
            if (!db || !currentSender) throw new Error("Chưa kết nối cơ sở dữ liệu.");

            const { collection, addDoc, doc, setDoc, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");

            let fileMeta = null;
            if (attachmentFile) {
                fileMeta = await NDChatCore.uploadAttachment(attachmentFile, currentSender.uid);
            }

            const senderCodeId = currentSender.codeId || 'guest';
            const targetCodeId = targetContact.codeId || (targetContact.isAdmin ? ADMIN_CODE_ID : '00000000');
            const chatId = `chat_${[senderCodeId, targetCodeId].sort().join('_')}`;

            const msgPayload = {
                text: (messageText || '').trim(),
                senderUid: currentSender.uid,
                senderCodeId: senderCodeId,
                senderNdid: currentSender.ndid || '',
                senderName: currentSender.displayName || currentSender.name || 'ND Member',
                senderAvatar: currentSender.photoURL || '/assets/images/logo.png',
                file: fileMeta || null,
                createdAt: serverTimestamp()
            };

            // Add message to subcollection
            const msgRef = await addDoc(collection(db, 'chats', chatId, 'messages'), msgPayload);

            // Update parent chat metadata
            const lastMsgText = fileMeta ? `[${fileMeta.category === 'image' ? 'Hình ảnh' : fileMeta.category === 'video' ? 'Video' : fileMeta.category === 'audio' ? 'Âm thanh' : 'Tệp tin'}] ${msgPayload.text}` : msgPayload.text;

            await setDoc(doc(db, 'chats', chatId), {
                participants: [senderCodeId, targetCodeId],
                participantDetails: {
                    [senderCodeId]: {
                        uid: currentSender.uid,
                        ndid: currentSender.ndid || '',
                        name: currentSender.displayName || currentSender.name || 'ND Member',
                        avatar: currentSender.photoURL || '/assets/images/logo.png'
                    },
                    [targetCodeId]: {
                        uid: targetContact.uid || null,
                        ndid: targetContact.ndid || '',
                        name: targetContact.name || 'Thành viên',
                        avatar: targetContact.avatar || '/assets/images/logo.png'
                    }
                },
                lastMessage: lastMsgText,
                lastMessageTime: serverTimestamp(),
                updatedAt: serverTimestamp()
            }, { merge: true });

            // If recipient is Admin Nhật Đăng -> forward email notification
            if (targetCodeId === ADMIN_CODE_ID || targetContact.ndid === ADMIN_NDID) {
                notifyAdminEmail(currentSender, messageText, fileMeta);
            }

            return { chatId, messageId: msgRef.id, payload: msgPayload };
        },

        // Send Group Message (Firebase Realtime Database)
        async sendGroupMessage(rdb, scopeId, roomId, currentSender, messageText, attachmentFile = null) {
            if (!rdb) throw new Error("Chưa kết nối cơ sở dữ liệu Realtime.");

            const { ref, push, set } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js");

            let fileMeta = null;
            if (attachmentFile) {
                fileMeta = await NDChatCore.uploadAttachment(attachmentFile, currentSender.uid);
            }

            const msgRef = push(ref(rdb, `mw_messages/${scopeId}/${roomId}`));
            const payload = {
                text: (messageText || '').trim(),
                senderId: currentSender.uid || 'guest',
                senderCodeId: currentSender.codeId || '',
                senderNdid: currentSender.ndid || '',
                senderName: currentSender.displayName || currentSender.name || 'ND Member',
                senderAvatar: currentSender.photoURL || '/assets/images/logo.png',
                file: fileMeta || null,
                timestamp: Date.now()
            };

            await set(msgRef, payload);
            return { messageId: msgRef.key, payload };
        }
    };

    window.NDChatCore = NDChatCore;
    console.log("🔥 NDChatCore Loaded Successfully");
})();
