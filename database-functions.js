const pg = require('pg')
const fs = require('fs');
const { nanoid } = require('nanoid');

var config = {
  user: "maxroach",
  host: "free-tier.gcp-us-central1.cockroachlabs.cloud",
  database: "subtle-seal-517.defaultdb",
  port: 26257,
  password: fs.readFileSync("./keys/password.txt").toString(),
  ssl: {
    ca: fs.readFileSync("./keys/cc-ca.crt").toString(),
  },
};

var pool = new pg.Pool(config);

function getQuery(name) {
  return fs.readFileSync("./sql/" + name).toString();
}

async function getUserID(smallId) {
  let result = await pool.query(getQuery("getuuid.sql"), [smallId]);
  return result.rows ? result.rows[0].id : null;
}

async function postImage(userUUID, url, text) {
  let result;
  result = await pool.query(getQuery("postImage.sql"), [userUUID, url, text]);
  return result;
}

async function newUser(userUUID){
  let smallid = nanoid(5)
  let result = await pool.query(getQuery("newuser.sql"), [userUUID, smallid])
  console.log(`made a new user with ${smallid} and ${userUUID}`)
  return smallid;
}

async function getPictureData(userUUID){
  let result = await pool.query(getQuery('getInfo.sql'),[userUUID])
  return result.rows;
  
}
async function getNanoID(userUUID){
  let result = await pool.query(getQuery('getshortid.sql'),[userUUID])
  return result.rows.length > 0 ? result.rows[0].smallid : null;
  
}

module.exports = {getUserID,postImage,newUser, getPictureData, getNanoID};
