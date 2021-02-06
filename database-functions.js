import pg from "pg";
import fs from "fs";

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

export async function getUserID(smallId) {
  let result = await pool.query(getQuery("getuuid.sql"), [smallId]);
  return result.rows ? result.rows[0].id : null;
}

export async function postImage(userUUID, url) {
  let result;
  result = await pool.query(getQuery("postImage.sql"), [userUUID, url]);
  return result;
}

