// Express
const bodyParser = require("body-parser");
const express = require("express");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { nanoid } = require("nanoid");
const { saveToGCP } = require("./google-cloud-stuff.js");
const isBase64 = require("is-base64");
const admin = require("firebase-admin");
const {
  postImage,
  getUserID,
  newUser,
  getPictureData,
  getNanoID,
} = require("./database-functions");
const uuid4 = require("uuid4");

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
    if (!("image" in req.body) && !"text") {
      res.status(404).send({ message: "no data found in body" });
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

app.use(bodyParser.json({ limit: "50mb" }));

// endpoints

app.get("/", (req, res) => {
  res.status(200).send("The server is running");
});

app.post("/picture", validatePicturePostReq, (req, res) => {
  let output = req.body.image;
  let text;
  if (req.body.text) {
    text = req.body.text;
  } else if(!output){
    res.status(400).send("missing data");
    return;
  }

  if(!output){
    postImage(res.locals.smallID, null, text).then((result) => {
      console.log( text+ " was saved to db(no picture)");
    });
    let response = {
      success: true,
    };
    res.send(response);
    return;
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

async function validateGoogleJWT(req, res, next) {
  try {
    let firbaseAuthToken = req.header("Authorization");
    //comment the debug part out for prod
    if (firbaseAuthToken == "newUserTest") {
      res.locals.uid = uuid4();
      next();
      return;
    }
    if (firbaseAuthToken == "getDataTest") {
      res.locals.uid = "c80be8a9-0275-4cd4-b8f3-102486a4f65b";
      next();
      return;
    }
    if (firbaseAuthToken == "getNanoidTest") {
      res.locals.uid = "c80be8a9-0275-4cd4-b8f3-102486a4f65b";
      next();
      return;
    }
    // debug ends here
    let decodedToken = await defaultAuth.verifyIdToken(firebaseAuthToken);
    const uid = decodedToken.uid;
    res.locals.uid = uid;
  } catch (err) {
    res.status(401).send({ message: err.toString() });
    return;
  }
  next();
}

app.post("/new_user", validateGoogleJWT, (req, res) => {
  try {
    const uid = res.locals.uid;
    newUser(uid).then((value) => {
      res.status(200).send({ message: "success", smallID: value });
    });
  } catch (err) {
    res
      .status(500)
      .send({ message: "does this user already exist?" + err.toString() });
  }
});

app.get("/info", validateGoogleJWT, (req, res) => {
  try {
    const uid = res.locals.uid;
    getPictureData(uid).then((result) => {
      res.status(200).send(result);
    });
  } catch (err) {
    res.status(500).send({ message: err.toString() });
  }
});

app.get("/nanoid", validateGoogleJWT, (req, res) => {
  try {
    const uid = res.locals.uid;
    getNanoID(uid).then((output) => {
      res.send({smallid: output});
    })
    
  } catch (err) {
    res.status(500).send({ message: err.toString() });
  }
});
//local test
/*
const PORT = 2020;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log("Press Ctrl+C to quit.");
});
console.log("stuff");
console.log(process.version);
*/



exports.app = app;
