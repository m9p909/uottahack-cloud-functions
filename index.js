// Express
import bodyParser from "body-parser";
import express from "express";
import fs from "fs";
import os from "os";
import path from "path";

import { nanoid } from "nanoid";
//import saveToGCP from "./google-cloud-stuff.js";
import isBase64 from "is-base64";
import admin from "firebase-admin";
import async from 'async'

let app = express();
let adm = admin.initializeApp()

function validateReq(req, res, next) {

  if (req.header("nanoid")) {
    res.local.userID = getUserID(req.header("nanoid"));
  } else {
    res.status(404).send({ message: "smallID not found" });
  }


  let imagestring = req.body.image;
  if (!("image" in req.body)) {
    res.status(404).send({ message: "image data not found" });
    return;
  }
  if (
    imagestring == undefined ||
    isBase64(imagestring, { allowEmpty: false })
  ) {
    res.status(404).send({ message: "invalid image data" });
    return;
  }

  next();
}
//no index.j
//
app.use(bodyParser.json());
app.get("/", (req, res) => {

  req.status(200).send("The server is running");
});




app.post("/", validateReq, (req, res) => {
  let filename = nanoid();
  let output = req.body.image;
  output = output.split("base64,")[1];


  fs.writeFileSync(path.join(os.tmpdir(), filename), output, { encoding: "base64" });

  try {
    saveToGCP(path.join(os.tmpdir(), filename), filename).then((gcpath) => {
      fs.unlinkSync(path.join(os.tmpdir(), filename));

      let response = {
        success: false,
        score: -1,
      };
      res.send(response);
    });
  } catch (err) {
    res.status(500).send(err);
  }
});


let session = {
  authUid: null,
  authToken: null,
  nanoId: null
}



app.post('/new_user', async function (req, res, next) {

  await admin.auth().verifyIdToken(req.query.token).then((decodedToken) => {

    session.authToken = req.query.token
    session.authUid = decodedToken.uid
    session.nanoId = " "
  })
    .catch((error) => {
      console.log(error)
    });

});




app.listen(8081, () => {
  console.log(`App listening on port 8080`);
  console.log("Press Ctrl+C to quit.");
});
console.log("stuff");
console.log(process.version);
