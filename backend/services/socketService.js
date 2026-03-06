let io;

export const setIo = (instance) => {
    io = instance;
};

export const getIo = () => {
    if (!io) {
        throw new Error("Socket.io instance not initialized");
    }
    return io;
};

export const emitToUser = (role, userId, event, payload) => {
    if (!io) return;
    const key = `${role}:${userId}`;
    // This assumes the server.js memberKey mapping
    // We can't directly access memberSockets from here easily without exporting it too
    // But we can use io.emit with a targeted field or use room joining
    io.emit(`clinical_update:${role}:${userId}`, payload);
};

export const emitToMeeting = (appointmentId, event, payload) => {
    if (!io) return;
    io.to(`meeting:${appointmentId}`).emit(event, payload);
};
