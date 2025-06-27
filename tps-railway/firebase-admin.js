// firebase-admin.js
const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: "canal-vivo-chat",
  });
}

const db = admin.firestore();
module.exports = { db };
