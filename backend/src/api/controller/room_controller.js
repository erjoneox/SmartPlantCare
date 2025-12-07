const RoomRepository = require("../../repository/room_repository");
const RoomService = require("../../service/room_service");

const roomRepository = new RoomRepository();
const roomService = new RoomService(roomRepository);

class RoomController {
  async addRoom(req, res) {
    try {
      const { name, comment } = req.body;
      const room = await roomService.addRoom(req.userId, name, comment);
      res.status(201).json(room);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getRooms(req, res) {
    try {
      const rooms = await roomService.getRooms(req.userId);
      res.json(rooms);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getRoom(req, res) {
    try {
      const { roomId } = req.params;
      const room = await roomService.getRoom(parseInt(roomId), req.userId);
      res.json(room);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateRoom(req, res) {
    try {
      const { roomId } = req.params;
      const { name, comment } = req.body;
      await roomService.updateRoom(parseInt(roomId), req.userId, name, comment);
      res.json({ message: "Room updated successfully" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteRoom(req, res) {
    try {
      const { roomId } = req.params;
      await roomService.deleteRoom(parseInt(roomId), req.userId);
      res.json({ message: "Room deleted successfully" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new RoomController();
