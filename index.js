const { faker, tr } = require('@faker-js/faker');
const mysql = require ('mysql2'); 
const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const { v4: uuidv4} = require("uuid");
app.use(methodOverride("_method"));
app.use(express.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname,"/views"));
let port = 8080;

const connection = mysql.createConnection ({
  host: "localhost",
  user: "root",
  database: "delta_app",
  password: "krishna@7840"
});

const getRandomUser = () => {
  return [
    faker.string.uuid(),
    faker.internet.username(),
    faker.internet.email(),
    faker.internet.password(),
  ];
};

//users count route
app.get("/", (req, res) => {
  let q = `SELECT count(*) FROM user`;
  try{
    connection.query(q, (err,result) => {
        if(err) throw err;
        let count = result[0] ["count(*)"]; 
        console.log(count); 
        res.render("home.ejs", {count});
    });
  } catch(err){
    console.log(err);
    res.send("some error occur in DB:");
  }
});

//all users route
app.get("/user", (req,res) => {
  let q = `SELECT * FROM user`;
  try{
    connection.query(q, (err,users) => {
      if(err) throw err;
      res.render("users.ejs", {users});
    });

  } catch(err){
    console.log(err);
    res.send("Some error in DB");
  }
});

//edit form 
app.get("/user/:id/edit", (req,res) => {
  let {id} = req.params;
  let q = `SELECT * FROM user WHERE id = '${id}'`;
  connection.query(q, (err, result) => {
    if(err) throw err;
    let user = result[0];
    res.render("edit.ejs", {user});
  });
});

//checking password integrity (DB updation)
app.patch("/user/:id", (req,res) => {
  let {id} = req.params;
  let {username: formUser, password: formPass} = req.body;
  let q = `SELECT * FROM user WHERE id = '${id}'`;
  connection.query(q, (err, result) => {
    if(err) throw err;
    let user = result[0];
    if(formPass != user.password){
      res.send("Wrong password!");
    }
    else{
      let q2 = `UPDATE user SET username='${formUser}' WHERE id='${id}'`;
      connection.query(q2, (err, result) => {
        if(err) throw err;
        console.log("SUCCESSFULLY CHANGED USERNAME");
        res.redirect("/user");
      });
    }
  });
});

// adding new user
app.get("/user/new", (req,res) => {
  res.render("new.ejs");
});

app.post("/user/new", (req, res) => {
  let {username, password} = req.body;
  let id = uuidv4();
  //query for adding new user
  let q = `INSERT INTO user (id, username, password) VALUES ('${id}', '${username}', '${password}')`;
  try{
    connection.query(q, (err, result) => {
      if(err) throw err;
      console.log(result);
      res.redirect("/user");
    });
  } catch (err) {
    console.log("DB error");
  }
});

app.get("/user/:id/delete", (req, res) => {
  let {id} = req.params;
  let q = `SELECT * FROM user WHERE id = '${id}'`;

  try{
    connection.query(q, (err, result) => {
      if(err) throw err;
      console.log(result);
      let user = result[0];
      res.render("delete.ejs", {user});
    });
  } catch (err) {
    console.log("DB error");
  }
});

app.delete("/user/:id", (req, res) => {
  let {id} = req.params;
  let {password: formPass} = req.body;
  let q = `SELECT * FROM user WHERE id ='${id}'`;
  try{ 
    connection.query(q, (err, result) => {
      if(err) throw err;
      let user = result[0];

      if(user.password != formPass){
        res.send("WRONG PASSWORD ENTERED:");
      } else {
        let q2 = `DELETE FROM user WHERE id = '${id}'`;
        connection.query(q2, (err, result) => {
          if(err) throw err
          else {
            console.log(result);
            console.log("DELETED SUCCESFULLY");
            res.redirect("/user");
          }
        });
      }
    });
  } catch (err) {
    console.log("ERROR IN DB");
  }
});
app.listen(port, ()=> {
  console.log("server is listening to port",port);
});