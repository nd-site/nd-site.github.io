/**
 * ND Labs — Unified Realtime Chat Core (Bộ lõi Trò chuyện Toàn cục dùng chung)
 * Dùng chung cho ChatND (/chat/) và Mini World Game (/games/miniworld/)
 */

(function () {
    // Flag check
    if (window.NDChatCore) return;

    let cachedAdminProfile = null;

    // Lấy thông tin Admin động từ cơ sở dữ liệu
    async function getAdminProfile(db) {
        if (cachedAdminProfile) return cachedAdminProfile;
        try {
            if (db) {
                const { collection, query, where, limit, getDocs } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");
                const snap = await getDocs(query(collection(db, 'users'), where('role', '==', 'admin'), limit(1)));
                if (!snap.empty) {
                    const data = snap.docs[0].data();
                    cachedAdminProfile = {
                        uid: snap.docs[0].id,
                        ndid: data.ndid || 'admin',
                        name: data.fullname || data.displayName || 'Admin',
                        avatar: data.photoURL || '/assets/images/logo.png',
                        email: data.recoveryEmail || data.email || null,
                        codeId: data.codeId || '00000000',
                        isAdmin: true
                    };
                    return cachedAdminProfile;
                }
            }
        } catch (e) {
            console.warn("Lỗi khi tải thông tin admin từ database:", e);
        }
        return null;
    }

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
    async function notifyAdminEmail(adminEmail, senderInfo, messageText, fileMeta) {
        if (!adminEmail) return;
        try {
            console.log(`📩 [Realtime Notification -> ${adminEmail}]:`, {
                sender: senderInfo,
                text: messageText,
                file: fileMeta,
                sentAt: new Date().toISOString()
            });

            // Call internal endpoint or log for automated relay
            if (window.sendEmailNotification) {
                await window.sendEmailNotification({
                    to: adminEmail,
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
        getAdminProfile,

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

            if (!fileUrl && window.uploadToImgBB) {
                try {
                    fileUrl = await window.uploadToImgBB(file);
                } catch (e) {}
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
            const targetCodeId = targetContact.codeId || '00000000';
            const chatId = `chat_${[senderCodeId, targetCodeId].sort().join('_')}`;

            const msgPayload = {
                text: (messageText || '').trim(),
                senderUid: currentSender.uid,
                senderCodeId: senderCodeId,
                senderNdid: currentSender.ndid || '',
                senderName: currentSender.displayName || currentSender.name || 'ND Member',
                senderAvatar: currentSender.photoURL || '/assets/images/logo.png',
                file: fileMeta || null,
                reactions: {},
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

            // If recipient is Admin -> forward email notification dynamically
            if (targetContact.isAdmin || targetContact.role === 'admin') {
                const adminEmail = targetContact.email || targetContact.recoveryEmail;
                if (adminEmail) {
                    notifyAdminEmail(adminEmail, currentSender, messageText, fileMeta);
                }
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

            const path = scopeId === 'chatnd' ? `chatnd_messages/${roomId}` : `mw_messages/${scopeId}/${roomId}`;
            const msgRef = push(ref(rdb, path));
            const payload = {
                text: (messageText || '').trim(),
                senderId: currentSender.uid || 'guest',
                senderCodeId: currentSender.codeId || '',
                senderNdid: currentSender.ndid || '',
                senderName: currentSender.displayName || currentSender.name || 'ND Member',
                senderAvatar: currentSender.photoURL || '/assets/images/logo.png',
                file: fileMeta || null,
                reactions: {},
                timestamp: Date.now()
            };

            await set(msgRef, payload);
            return { messageId: msgRef.key, payload };
        },

        // Update Group Information (Owner, Deputy or Admin)
        async updateGroupInfo(rdb, currentGroupId, newGroupId, groupData) {
            if (!rdb) throw new Error("Chưa kết nối cơ sở dữ liệu.");
            const { ref, get, set, remove, update } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js");

            if (newGroupId && newGroupId !== currentGroupId) {
                // Moving group to new ID
                const targetRef = ref(rdb, `chatnd_groups/${newGroupId}`);
                const targetSnap = await get(targetRef);
                if (targetSnap.exists()) {
                    throw new Error(`ID nhóm "${newGroupId}" đã tồn tại. Vui lòng chọn ID khác.`);
                }

                // Copy existing group info and messages
                const curGroupSnap = await get(ref(rdb, `chatnd_groups/${currentGroupId}`));
                const curMsgSnap = await get(ref(rdb, `chatnd_messages/${currentGroupId}`));

                const mergedData = { ...(curGroupSnap.val() || {}), ...groupData, groupId: newGroupId, updatedAt: Date.now() };
                await set(ref(rdb, `chatnd_groups/${newGroupId}`), mergedData);
                
                if (curMsgSnap.exists()) {
                    await set(ref(rdb, `chatnd_messages/${newGroupId}`), curMsgSnap.val());
                }

                // Remove old refs
                await remove(ref(rdb, `chatnd_groups/${currentGroupId}`));
                await remove(ref(rdb, `chatnd_messages/${currentGroupId}`));

                return { success: true, newGroupId };
            } else {
                await update(ref(rdb, `chatnd_groups/${currentGroupId}`), {
                    ...groupData,
                    updatedAt: Date.now()
                });
                return { success: true, newGroupId: currentGroupId };
            }
        },

        // Change Group Owner
        async changeGroupOwner(rdb, groupId, newOwnerUid, currentOwnerUid) {
            if (!rdb) throw new Error("Chưa kết nối cơ sở dữ liệu.");
            const { ref, update } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js");

            const updates = {
                [`chatnd_groups/${groupId}/createdBy`]: newOwnerUid,
                [`chatnd_groups/${groupId}/members/${newOwnerUid}/role`]: 'owner',
                [`chatnd_groups/${groupId}/members/${currentOwnerUid}/role`]: 'deputy',
                [`chatnd_groups/${groupId}/updatedAt`]: Date.now()
            };

            await update(ref(rdb), updates);
            return { success: true };
        },

        // Set or Remove Deputy
        async setGroupDeputy(rdb, groupId, targetUid, isDeputy) {
            if (!rdb) throw new Error("Chưa kết nối cơ sở dữ liệu.");
            const { ref, update } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js");

            const newRole = isDeputy ? 'deputy' : 'member';
            await update(ref(rdb, `chatnd_groups/${groupId}/members/${targetUid}`), {
                role: newRole,
                updatedAt: Date.now()
            });
            return { success: true, role: newRole };
        },

        // Remove Member from Group
        async removeGroupMember(rdb, groupId, targetUid) {
            if (!rdb) throw new Error("Chưa kết nối cơ sở dữ liệu.");
            const { ref, remove } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js");

            await remove(ref(rdb, `chatnd_groups/${groupId}/members/${targetUid}`));
            return { success: true };
        },

        // Delete Group Chat permanently (Owner or Admin)
        async deleteGroup(rdb, groupId) {
            if (!rdb) throw new Error("Chưa kết nối cơ sở dữ liệu.");
            const { ref, remove } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js");

            await remove(ref(rdb, `chatnd_groups/${groupId}`));
            await remove(ref(rdb, `chatnd_messages/${groupId}`));
            return { success: true };
        },

        // Add Message Reaction
        async setMessageReaction(rdb, db, isGroup, chatIdOrGroupId, messageId, userUid, emoji) {
            if (isGroup) {
                if (!rdb) return;
                const { ref, set, remove } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js");
                const reactionRef = ref(rdb, `chatnd_messages/${chatIdOrGroupId}/${messageId}/reactions/${userUid}`);
                if (!emoji) {
                    await remove(reactionRef);
                } else {
                    await set(reactionRef, emoji);
                }
            } else {
                if (!db) return;
                const { doc, updateDoc, deleteField } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");
                const msgDoc = doc(db, 'chats', chatIdOrGroupId, 'messages', messageId);
                if (!emoji) {
                    await updateDoc(msgDoc, { [`reactions.${userUid}`]: deleteField() });
                } else {
                    await updateDoc(msgDoc, { [`reactions.${userUid}`]: emoji });
                }
            }
        }
    };

    window.NDChatCore = NDChatCore;
    console.log("🔥 NDChatCore Enhanced Loaded Successfully");
})();
