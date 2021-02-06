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
import {postImage, getUserID} from './database-functions.js'

const fbapp = admin.initializeApp();
const defaultAuth = fbapp.auth();

let app = express();


function validatePicturePostReq(req, res, next) {
  //check header, and verify nanoid
  if(req.header("nanoid")){
    res.locals.smallID = getUserID(req.header("nanoid"));
  } else {
    res.status(404).send({ message: "smallID not found" });
  }
  
  //verify image
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


app.post("/picture", validatePicturePostReq, (req, res) => {
  
  
  let output = req.body.image;
  //split the mimetype and data
  
  let filetype = "";
  //get the mimetype
  filetype = output.match("\\w*\\;")[0];
  filetype = filetype.replace(';','');
  //remove mimetype
  output = output.split("base64,")[1]
  let filename = nanoid()+"."+filetype;

  //write image to file
  fs.writeFileSync(path.join(os.tmpdir(), filename), output, {encoding: "base64"});

  try {
    saveToGCP(path.join(os.tmpdir(), filename), filename).then((gcpath) => {
      fs.unlinkSync(path.join(os.tmpdir(), filename));
      postImage(res.locals.smallID, gcpath).then((result) => {
        console.log(result.rows[0].imageurl + " was saved to db");
      })
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

app.listen(4000, () => {
  console.log(`App listening on port 4000`);
  console.log("Press Ctrl+C to quit.");
});
console.log("stuff");
console.log(process.version);
