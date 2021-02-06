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


export default function getUserID(smallId) {
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

  });
}

export default function insert(session) {

  pool.connect((err, client, done) => {
    // Close communication with the database and exit.
    var finish = function () {
      client.query('INSERT INTO accounts (uuid, nanoid) VALUES (1, 1000);', next);
      done();
      process.exit();
    };
    if (err) {
      console.error('could not connect to cockroachdb', err);
      finish();
    }

  });
}



