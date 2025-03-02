const { faker, da } = require("@faker-js/faker");
const mysql = require("mysql2");
const express = require("express");
const app = express();
const port = 8080;
const path = require("path");
const methodOverride = require("method-override");
const { v4: uuidv4 } = require("uuid");

app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

app.use(express.static(path.join(__dirname, "public")));

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "DELTA_APP",
  password: "KingOfHell@02",
});

let getRandomUser = () => {
  return [
    faker.string.uuid(),
    faker.internet.username(), // before version 9.1.0, use userName()
    faker.internet.email(),
    faker.internet.password(),
  ];
};

//inserting bulk data
// let data = [];
// for (let i = 0; i <= 100; i++) {
//   data.push(getRandomUser());
// }

// console.log(data);
//inserting multiple data to tables
// let query = "INSERT INTO USER(ID,USERNAME,EMAIL,PASSWORD) VALUES ?";
// let user1 = ["123b", "123_newuserb", "abc@gmail.comb", "absb"];
// let user2 = ["123c", "123_newuserc", "abc@gmail.comc", "absc"];
// let user3 = ["123d", "123_newuserd", "abc@gmail.comd", "absd"];

// let users = [user1, user2, user3];

// try {
//   connection.query(query, [data], (err, res) => {
//     if (err) {
//       throw err;
//     }
//     // console.log(res);
//   });
// } catch (error) {
//   console.log(error);
// }
// connection.end();

app.get("/", (req, res) => {
  let q = "SELECT COUNT(*) FROM USER";
  try {
    connection.query(q, (err, ress) => {
      if (err) {
        throw err;
      }
      let count = ress[0]["COUNT(*)"];

      res.render("home.ejs", { count });
    });
  } catch (error) {
    console.log(error);
    res.send("error");
  }
});

app.get("/user", (req, res) => {
  let q = "SELECT * FROM user";
  try {
    connection.query(q, (err, ress) => {
      if (err) {
        throw err;
      }
      let data = ress;
      res.render("user.ejs", { data });
    });
  } catch (error) {
    res.send("Some error");
  }
});

app.get("/user/:id/edit", (req, res) => {
  let { id } = req.params;
  let q = `SELECT * FROM user WHERE ID = '${id}'`;
  try {
    connection.query(q, (err, ress) => {
      if (err) throw err;
      let data = ress[0];
      console.log(data);
      res.render("edit.ejs", { data });
    });
  } catch (error) {
    console.log(error);
    res.send("Some Error");
  }
});

app.patch("/user/:id", (req, res) => {
  let { id } = req.params;
  let { username: user, password: pass } = req.body;
  let q = `SELECT * FROM user WHERE ID = '${id}'`;

  try {
    connection.query(q, (err, ress) => {
      if (err) throw err;
      let data = ress[0];
      if (pass != data.PASSWORD) {
        res.send("Password is incorrect");
      } else {
        let query = `UPDATE user SET username = '${user}' WHERE ID = '${id}'`;
        connection.query(query, (err, result) => {
          if (err) throw err;
          res.redirect("/user");
        });
      }
    });
  } catch (error) {
    console.log(error);
    res.send("Some error");
  }
});

app.get("/user/add", (req, res) => {
  res.render("adduser.ejs");
});
app.post("/user/add", (req, res) => {
  let { username, password, email } = req.body;
  let q = `INSERT INTO user (ID,USERNAME,EMAIL,PASSWORD) values (?,?,?,?)`;
  let user = [];
  user.push(uuidv4(), username, email, password);
  try {
    connection.query(q, user, (err, ress) => {
      if (err) throw err;
      res.redirect("/user");
    });
  } catch (error) {
    res.send("Error in inserting");
  }
});

app.delete("/user/:id", (req, res) => {
  let { id } = req.params;
  let q = `DELETE FROM user WHERE ID = '${id}'`;
  try {
    connection.query(q, (err, ress) => {
      if (err) throw err;
      res.redirect("/user");
    });
  } catch (error) {
    res.send(error);

    console.log(error);
  }
});

app.listen(port, (req, res) => {
  console.log(`app is listening on http://localhost/${port}`);
});
