const express = require("express");
const multer = require("multer");
const { Client: MinioClient } = require("minio");
const upload = multer({ dest: "ficheros_subidos/" });
const pg = require("pg");
const pool = new pg.Pool({
  user: "postgres",
  host: "localhost",
  database: "postgres",
  password: "postgres",
  port: 5436,
});
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get("/", (req, res) => {
  res.send("Hello World");
});
const bucket = "curso";
const minioClient = new MinioClient({
  endPoint: "localhost",
  port: 9002,
  accessKey: "minioadmin",
  secretKey: "minioadmin",
  useSSL: false,
  region: "us-east-1",
});
async function initDatabse() {
  await pool.query(`
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    password VARCHAR(50) NOT NULL
);
`);
  await pool.query(`
CREATE TABLE IF NOT EXISTS files (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    user_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
`);
  await pool.query(`
CREATE TABLE IF NOT EXISTS users_files (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    file_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (file_id) REFERENCES files(id)
)
`);
}

// asignar un usuario a un fichero
initDatabse();
app.post("/users", (req, res) => {
  const { name, password } = req.body;
  // TODO: hash password
  pool.query(
    `INSERT INTO users (name, password) VALUES ('${name}', '${password}')`,
    (err, result) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.status(200).send(result);
      }
    }
  );
});
app.get("/users", (req, res) => {
  pool.query("SELECT * FROM users", (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(result.rows);
    }
  });
});

app.get("/buckets", async (req, res) => {
  try {
    const buckets = await minioClient.listBuckets();
    res.send(buckets);
  } catch (e) {
    res.send(e);
  }
});

// /ficheros/curso.html
app.get("/ficheros/:nombre", async (req, res) => {
  try {
    const info = await minioClient.statObject(bucket, req.params.nombre);
    const dataStream = await minioClient.getObject(bucket, req.params.nombre);
    res.type(info.metaData["content-type"]);
    dataStream.pipe(res);
  } catch (e) {
    res.send(e);
  }
});

app.post("/ficheros", upload.single("fichero"), async (req, res) => {
  try {
    const file = req.file;
    await minioClient.fPutObject(bucket, file.originalname, file.path, {
      "content-type": file.mimetype,
    });
    const userId = (req.headers["user-id"] = req.headers["user-id"] || 1);
    await pool.query(
      `INSERT INTO files (name, user_id) VALUES ('${file.originalname}', ${userId})`
    );
    res.send("File uploaded");
  } catch (e) {
    res.send(e);
  }
});
app.get("/ficheros", async (req, res) => {
  try {
    const userId = req.headers["user-id"] || 1;
    const files = await pool.query(
      `SELECT * FROM files WHERE user_id = ${userId}`
    );
    res.send(files.rows);
  } catch (e) {
    res.send(e);
  }
});
// /ficheros/12/permisos
app.post("/ficheros/:id/permisos", async (req, res) => {
  const fileId = req.params.id; // fileId=12
  const userId = req.headers["user-id"] || 1;
  try {
    await pool.query(
      `INSERT INTO users_files (user_id, file_id) VALUES (${userId}, ${fileId})`
    );
    res.send("Permisos asignados");
  } catch (e) {
    res.send(e);
  }
});

const server = app.listen(3000, "0.0.0.0", () => {
  const address = server.address();
  console.log(`Server listening on ${address.address}:${address.port}`);
});
