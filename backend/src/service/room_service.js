class RoomService {
  constructor(roomRepository) {
    this.roomRepository = roomRepository;
  }

  async addRoom(userId, name, comment) {
    if (!userId || !name) {
      throw new Error("User ID and room name are required");
    }
    return this.roomRepository.createRoom(userId, name, comment);
  }

  async getRooms(userId) {
    if (!userId) {
      throw new Error("User ID is required");
    }
    return this.roomRepository.getRoomsByUserId(userId);
  }

  async getRoom(roomId, userId) {
    if (!roomId || !userId) {
      throw new Error("Room ID and User ID are required");
    }
    const room = await this.roomRepository.getRoomById(roomId, userId);
    if (!room) {
      throw new Error("Room not found");
    }
    return room;
  }

  async updateRoom(roomId, userId, name, comment) {
    if (!roomId || !userId || !name) {
      throw new Error("Room ID, User ID, and name are required");
    }
    const success = await this.roomRepository.updateRoom(
      roomId,
      userId,
      name,
      comment
    );
    if (!success) {
      throw new Error("Failed to update room");
    }
    return success;
  }

  async deleteRoom(roomId, userId) {
    if (!roomId || !userId) {
      throw new Error("Room ID and User ID are required");
    }
    const success = await this.roomRepository.deleteRoom(roomId, userId);
    if (!success) {
      throw new Error("Room not found or unauthorized");
    }
    return success;
  }
}

module.exports = RoomService;
