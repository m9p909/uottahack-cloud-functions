// Express
import bodyParser from "body-parser";
import express from "express";
import fs from "fs";
import os from "os";
import path from "path";
import { nanoid } from "nanoid";
import saveToGCP, { annotateImage } from "./google-cloud-stuff.js";
import isBase64 from "is-base64";
import admin from "firebase-admin";
import { postImage, getUserID } from "./database-functions.js";

const fbapp = admin.initializeApp();
const defaultAuth = fbapp.auth();

let app = express();

async function validatePicturePostReq(req, res, next) {
  //check header, and verify nanoid
  try {
    if (req.header("nanoid")) {
      res.locals.smallID = await getUserID(req.header("nanoid"));
      if (!res.locals.smallID)
        res.status(404).send({ message: "user does not exist" });
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
  } catch (err) {
    res.status(500).send({ message: "data verification server error" });
    return;
  }

  next();
}
// endpoints

app.use(bodyParser.json({limit:"50mb"}));
app.get("/", (req, res) => {
  req.status(200).send("The server is running");
});

app.post("/picture", validatePicturePostReq, (req, res) => {
  let output = req.body.image;
  //split the mimetype and data

  let filetype = "";
  //get the mimetype
  filetype = output.match("\\w*\\;")[0];
  filetype = filetype.replace(";", "");
  //remove mimetype
  output = output.split("base64,")[1];
  let filename = nanoid() + "." + filetype;

  //write image to file
  fs.writeFileSync(path.join(os.tmpdir(), filename), output, {
    encoding: "base64",
  });

  try {
    saveToGCP(path.join(os.tmpdir(), filename), filename).then((url) => {
      fs.unlinkSync(path.join(os.tmpdir(), filename));
      postImage(res.locals.smallID, url).then((result) => {
        console.log(result.rows[0].imageurl + " was saved to db");
        annotateImage(filename).then()
      });
      
      let response = {
        success: true,
      };
      res.send(response);
    });
  } catch (err) {
    res.status(500).send(err);
  }
});

const PORT = 4000
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log("Press Ctrl+C to quit.");
});
console.log("stuff");
console.log(process.version);
