import pg from "pg";
import fs from "fs";

var config = {
  user: "maxroach",
  host: "free-tier.gcp-us-central1.cockroachlabs.cloud",
  database: "subtle-seal-517.defaultdb",
  port: 26257,
  password: fs.readFileSync("./keys/password.txt").toString(),
  ssl: {
      ca: fs.readFileSync('./keys/cc-ca.crt').toString()
  }
};

var pool = new pg.Pool(config);

function getQuery(name){
    return fs.readFileSync('./sql/'+name).toString();
}
export function getUserID(smallId) {
  pool.connect((err, client, done) => {
    // Close communication with the database and exit.
    var finish = function () {
      done();
      process.exit();
    };
    if (err) {
        console.error('could not connect to cockroachdb', err);
        finish();
    }
    client.query(getQuery("getuuid.sql"))

  });
}

export function postImage(userUUID) {
  pool.connect((err, client, done) => {
    // Close communication with the database and exit.
    var finish = function () {
      done();
      process.exit();
    };
    if (err) {
        console.error('could not connect to cockroachdb', err);
        finish();
    }
    client.query(getQuery("postImage.sql"))

  });
}
