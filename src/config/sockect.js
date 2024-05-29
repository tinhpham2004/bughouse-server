// const User = require("../model/user/user.model");

// const addSokectIdToUser = async (socketId, userId) => {
//   const user = await User.findById(userId);
//   if (socketId) { user.socketId = socketId; }

//   await user.save();
// };

const socket = (io) => {
  io.on("connect", (socket) => {
    socket.on("disconnect", () => {
    });

    socket.on("join", (userId) => {
      socket.userId = userId;
      socket.join(userId);
      console.log(`Socket ID ${socket.userId} connect!`);
    });
  });
};

module.exports = socket;
