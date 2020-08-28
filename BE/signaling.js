const admin = require('firebase-admin');
const db = admin.database();

const setIoServer = function (server) {
  const ioServer = require('socket.io')(server);

  let userlist;
  db.ref('/onlineUserList').on('value', (snapshot) => {
    userlist = snapshot.val();
  });

  function OnlineUserChecker() {
    if (userlist === null || userlist === undefined) return;
    if (Object.keys(userlist).length > 0) {
      const rooms = Object.keys(userlist);
      rooms.forEach((room) => {
        const users = Object.keys(userlist[room]);
        users.forEach((user) => {
          if (userlist[room][user].signaled === true) {
            db.ref(`/onlineUserList/${room}/${user}`).update({
              signaled: false,
            });
          } else {
            console.log('A user disconnected = ', userlist[room][user]);
            const roomId = userlist[room][user].roomId;
            db.ref(`/onlineUserList/${room}/${user}`).remove();
            db.ref(`/rooms/${roomId}/userOnline/${user}`).remove();
          }
        });
      });
    }
  }
  setInterval(() => {
    OnlineUserChecker();
  }, 10000);

  // socket io
  ioServer.sockets.on('connection', (socket) => {
    console.log('user connected', socket.id);
    socket.emit('sessionID', socket.id);

    function log(...message) {
      const array = ['Message from server:'];
      array.push.apply(array, message);
      socket.emit('log', array);
    }

    socket.on('message', (message) => {
      log('Client said: ', message);
      if (message.sendTo === undefined) {
        socket.to(message.room).emit('message', message);
      } else {
        socket.to(message.sendTo).emit('message', message);
      }
    });

    socket.on('create or join', (roomName, user, roomId) => {
      if (user === null || user === undefined) return;
      log('Received request to create or join room' + roomName);
      const newUser = {
        email: user.email,
        uid: user.uid,
        displayName: user.displayName,
        roomId: roomId,
        sessionId: socket.id,
        signaled: true,
      };

      const clientsInRoom = ioServer.sockets.adapter.rooms[roomName];
      const numClients = clientsInRoom
        ? Object.keys(clientsInRoom.sockets).length
        : 0;
      log(`${roomName} now has ${numClients + 1} client(s)`);

      if (numClients === 0) {
        socket.join(roomName);
        log(`${socket.id} created ${roomName}`);
        socket.emit('created', roomName, socket.id);

        // 새로운 방 생성
        db.ref(`/onlineUserList/${roomName}/${socket.id}`).update(newUser);
        console.log('새로운 방 생성 후 userlist = ', userlist);
      } else {
        socket.join(roomName);
        log(`${socket.id} joined ${roomName}`);
        ioServer.sockets
          .in(roomName)
          .emit(
            'joined',
            roomName,
            socket.id,
            ioServer.sockets.adapter.rooms[roomName]
          );

        db.ref(`/onlineUserList/${roomName}/${socket.id}`).update(newUser);
        console.log('유저 추가 후 userlist = ', userlist);
      }
      db.ref(`/rooms/${roomId}/userOnline/${socket.id}`).update(newUser);
    });

    socket.on('disconnect', () => {
      // Searching room name
      if (userlist === null || userlist === undefined) return;
      const rooms = Object.keys(userlist);
      let roomName;
      let theUser;
      rooms.some((room) => {
        const user = Object.keys(userlist[room]);
        theUser = user.filter((userinfo) => userinfo === socket.id);
        if (theUser.length > 0) {
          roomName = room;
          return true;
        }
      });
      if (theUser.length === 0) {
        return;
      }
      console.log('theUser', userlist[roomName][theUser]);

      // signal connected users
      log('user leave the room anyway ' + roomName);
      console.log('유저 ' + roomName + '에서 강제 종료' + socket.id);
      socket
        .to(roomName)
        .emit('userLeft', ioServer.sockets.adapter.rooms[roomName], socket.id);

      // delete user from room or room iteself
      const clientsInRoom = ioServer.sockets.adapter.rooms[roomName];
      const numClients = clientsInRoom
        ? Object.keys(clientsInRoom.sockets).length
        : 0;
      const roomId = userlist[roomName][theUser].roomId;
      console.log('강제 연결 해제할 유저가 속한 roomId = ', roomId);
      db.ref(`/onlineUserList/${roomName}/${theUser}`).remove();
      db.ref(`/rooms/${roomId}/userOnline/${theUser}`).remove();
      console.log('강제 연결 종료 후 userlist = ', userlist);
    });

    socket.on('leave room', (roomName, roomId) => {
      log('Received request to leave the room' + roomName);
      console.log('roomId = ', roomId);

      socket.leave(roomName, () => {
        socket
          .to(roomName)
          .emit(
            'userLeft',
            ioServer.sockets.adapter.rooms[roomName],
            socket.id
          );
      });

      // delete user from room or room iteself
      const clientsInRoom = ioServer.sockets.adapter.rooms[roomName];
      const numClients = clientsInRoom
        ? Object.keys(clientsInRoom.sockets).length
        : 0;
      if (numClients === 0) {
        db.ref(`/onlineUserList/${roomName}`).remove();
        db.ref(`/rooms/${roomId}/userOnline`).remove();
      } else {
        db.ref(`/onlineUserList/${roomName}/${socket.id}`).remove();
        db.ref(`/rooms/${roomId}/userOnline/${socket.id}`).remove();
      }
      console.log('한 명이 방을 나간 후 userlist =', userlist);
    });

    socket.on('disconnectRequest', (fromUser, toUser) => {
      ioServer.to(toUser).emit('disconnectRequest', fromUser);
    });

    socket.on('ImOnline', (roomName) => {
      if (
        userlist === null ||
        userlist === undefined ||
        userlist[roomName] === undefined ||
        userlist[roomName][socket.id] === undefined
      ) {
        return;
      }

      db.ref(`/onlineUserList/${roomName}/${socket.id}`).update({
        signaled: true,
      });
    });
  });
};
module.exports = setIoServer;
