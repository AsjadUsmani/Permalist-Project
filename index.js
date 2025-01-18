import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

let currentItemId = 1;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "permalist",
  password: "asjad@786",
  port: 5432
});

db.connect();

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let items = [
  { id: 1, title: "Buy milk" },
  { id: 2, title: "Finish homework" },
];

async function pushItemIntoDb(params){
  const result = await db.query("INSERT INTO items(title) VALUES($1) RETURNING *;",[params]);
  return result.rows;
}

async function fetchItemsFromDb() {
  const result = await db.query("SELECT * FROM items");
  return result.rows;
}

app.get("/", async(req, res) => {
  const data = await fetchItemsFromDb();
  res.render("index.ejs", {
    listTitle: "Today",
    listItems: data,
  });
});

app.post("/add", async(req, res) => {
  const item = req.body.newItem;
  const currentItem = await pushItemIntoDb(item);
  res.redirect("/");
});

app.post("/edit", async(req, res) => {
  const item = req.body.updatedItemTitle;
  const id = req.body.updatedItemId;

  try {
    await db.query("UPDATE items SET title = ($1) WHERE id = $2", [item, id]);
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});

app.post("/delete", async(req, res) => {
  const deleteItemId = req.body.deleteItemId;
  await db.query("DELETE FROM items WHERE id = $1",[deleteItemId])
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
