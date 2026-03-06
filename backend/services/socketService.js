let io;
const memberSockets = new Map();
const socketMembers = new Map();

export const setIo = (instance) => {
    io = instance;
};

export const getIo = () => {
    if (!io) {
        throw new Error("Socket.io instance not initialized");
    }
    return io;
};

// Internal key generator
export const memberKey = (role, userId) => `${role}:${userId}`;

export const registerSocketMember = (socket, role, id) => {
    const key = memberKey(role, id);
    if (!memberSockets.has(key)) memberSockets.set(key, new Set());
    memberSockets.get(key).add(socket.id);
    socketMembers.set(socket.id, key);

    // Also join a private room for easy global targeting by ID
    socket.join(`user:${key}`);
    console.log(`🔌 Registered socket ${socket.id} for ${key}`);
};

export const unregisterSocket = (socketId) => {
    const key = socketMembers.get(socketId);
    if (!key) return;
    const sockets = memberSockets.get(key);
    if (sockets) {
        sockets.delete(socketId);
        if (sockets.size === 0) memberSockets.delete(key);
    }
    socketMembers.delete(socketId);
};

export const emitToRoomMembers = (room, event, payload, excludeSocketId = null) => {
    if (!room?.members?.length) return;
    room.members.forEach(member => {
        const key = memberKey(member.role, member.userId);
        const sockets = memberSockets.get(key);
        if (!sockets) return;
        sockets.forEach(socketId => {
            if (socketId === excludeSocketId) return;
            io.to(socketId).emit(event, payload);
        });
    });
};

export const emitToUser = (role, userId, event, payload) => {
    if (!io) return;
    const key = memberKey(role, userId);
    // Emit to the user's private room (handles multiple devices gracefully)
    io.to(`user:${key}`).emit(event, payload);

    // For backwards compatibility
    io.emit(`clinical_update:${key}`, payload);
};

export const emitToMeeting = (appointmentId, event, payload) => {
    if (!io) return;
    io.to(`meeting:${appointmentId}`).emit(event, payload);
};

/**
 * Emit a notification to a specific user
 * @param {string} role - 'patient', 'doctor', 'admin', etc.
 * @param {string} userId - The user's database ID
 * @param {Object} notification - The notification object
 */
export const emitNotification = (role, userId, notification) => {
    if (!io) return;
    emitToUser(role, userId, 'new_notification', notification);
};

