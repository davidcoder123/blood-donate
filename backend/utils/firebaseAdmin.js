const admin = require("firebase-admin");
const serviceAccount = require("../config/serviceAccountKey.json"); // Downloaded from Firebase Console

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
