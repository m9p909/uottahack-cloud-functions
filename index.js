// Express
const bodyParser = require("body-parser");
const express = require("express");
const fs = require("fs");
const os = require("os")
const path = require("path");
const {nanoid} = require("nanoid");
const {saveToGCP} = require("./google-cloud-stuff.js")
const isBase64 = require("is-base64");
const admin = require("firebase-admin");
const { postImage, getUserID } = require("./database-functions")

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

app.use(bodyParser.json({limit:"50mb"}));

// endpoints
app.get("/", (req, res) => {
  req.status(200).send("The server is running");
});

app.post("/picture", validatePicturePostReq, (req, res) => {
  let output = req.body.image;
  let text;
  if(req.body.text){
    text = req.body.text;
  }
  
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
      
      postImage(res.locals.smallID, url, text).then((result) => {
        console.log(result.rows[0].imageurl + " was saved to db");
        
      });
      
      let response = {
        success: true,
      };
      res.send(response);
    });
  } catch (err) {
    res.status(500).send(err);
    console.log(err);
  }
});
//local test
/*
const PORT = 2020
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log("Press Ctrl+C to quit.");
});
console.log("stuff");
console.log(process.version);
*/
exports.app = app;


