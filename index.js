// Express
import bodyParser from "body-parser";
import express from "express";
import fs from "fs";
import os from "os";
import path from "path";
import { nanoid } from "nanoid";
import saveToGCP from "./google-cloud-stuff.js";
import isBase64 from "is-base64";
import admin from "firebase-admin";

const fbapp = admin.initializeApp();
const defaultAuth = fbapp.auth();

let app = express();

function validateReq(req, res, next) {
  defaultAuth.verifyIdToken(req.header("authToken")).then((decodedToken) => {
    let uid = decodedToken.uid;
    res.locals.userid = uid;
  });

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
app.use(bodyParser.json());
app.get("/", (req, res) => {
  req.status(200).send("The server is running");
});

function saveImagetoDB(gcpath) {}

app.post("/", validateReq, (req, res) => {
  let filename = nanoid();
  let output = req.body;

  fs.writeFileSync(path.join(os.tmpdir(), filename), output);

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

app.listen(8081, () => {
  console.log(`App listening on port 8080`);
  console.log("Press Ctrl+C to quit.");
});
console.log("stuff");
console.log(process.version);
