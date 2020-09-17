const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const serviceAccount = require("../credentials/serviceAccountKey.json");
const firebaseConfigKey = require("../credentials/firebaseConfigKey.json");
const CryptoJS = require("crypto-js");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://soma-team-183.firebaseio.com",
});

const db = admin.database();


// next 이용해서 띄어놓을 수 있으면 좋겠다.
router.post("/createRoom", (req, res, next) => {
  const { roomName, userName, host } = req.body;
  const roomDetail = { roomName, host, hostName: userName };
  // create room
  const newRoomRef = db.ref("/rooms").push({
    roomDetail,
  });

  const roomId = newRoomRef.key;
  // add host in room's userList
  db.ref(`/rooms/${roomId}/userlist/${host}`).update({
    uid: host,
    userName,
    host: true,
  });
  // create messageHub for the room
  db.ref(`/messageHub/${roomId}/messages`).push({
    message: userName + " created " + roomName,
    sender: "bot",
    sentAt: admin.database.ServerValue.TIMESTAMP,
  });

  db.ref(`/messageHub/${roomId}`).update({
    roomName,
  });

  // add the created room on user's fav list
  db.ref(`/users/${host}/favRooms/${roomId}`).update({
    roomDetail,
  });
  res.status(201);
});

router.post("/addFavRoom", async (req, res, next) => {
  const { uid, userName, roomId } = req.body;

  let roomDetail;
  try {
    // db에서 room detail을 받아옴.
    await db.ref(`/rooms/${roomId}`).once("value", (data) => {
      roomDetail = data.val().roomDetail;
    });

    // 받아온 db detail을 user의 favorite room에 추가
    db.ref(`/users/${uid}/favRooms/${roomId}`).update({
      roomDetail,
    });

    // room의 userlist에 user를 등록
    db.ref(`/rooms/${roomId}/userlist/${uid}`).update({
      uid,
      userName,
      host: false,
    });
  } catch (error) {
    console.log("Error creating new user: ", error);
  }

  res.status(201);
});

router.post("/leaveTeam", (req, res) => {
  const { roomId, uid } = req.body;
  leaveTeam(roomId, uid);

  res.status(201);
});
router.post("/delegateHost", (req, res) => {
  const { roomId, uid, userName } = req.body;

  db.ref(`/rooms/${roomId}/userlist/${uid}`).update({ host: true });
  db.ref(`/rooms/${roomId}/roomDetail`).update({
    host: uid,
    hostName: userName,
  });

  let userlist;
  db.ref(`/rooms/${roomId}/userlist`).once("value", async (data) => {
    try {
      userlist = await data.val();
      console.log(userlist);
      for (const user in userlist) {
        db.ref(`/users/${user}/favRooms/${roomId}/roomDetail`).update({
          host: uid,
          hostName: userName,
        });
      }
    } catch (error) {
      console.log(error);
    }
  });
});

router.post("/deleteTeam", (req, res) => {
  const { roomId, uid } = req.body;
  console.log(roomId, uid);

  let userlist;
  db.ref(`/rooms/${roomId}/userlist`).once("value", async (data) => {
    try {
      userlist = await data.val();

      for (const user in userlist) {
        leaveTeam(roomId, user);
      }

      db.ref(`/messageHub/${roomId}`).remove();
      db.ref(`/rooms/${roomId}`).remove();
    } catch (error) {
      console.log(error);
    }
  });

  res.status(201);
});

function leaveTeam(roomId, uid) {
  db.ref(`/users/${uid}/favRooms/${roomId}`).remove();
  db.ref(`/rooms/${roomId}/userlist/${uid}`).remove();
}

router.post("/message", async (req, res) => {
  const { roomId, displayName, message } = req.body;

  db.ref("/messageHub/" + roomId + "/messages").push({
    sender: displayName,
    message,
    sentAt: admin.database.ServerValue.TIMESTAMP,
  });
  res.status(201);
});

module.exports = router;
