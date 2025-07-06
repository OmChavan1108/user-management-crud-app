const { faker } = require('@faker-js/faker');    //faker
const mysql = require('mysql2');         //mysql2
const express=require('express');   //express
const app=express();       
const path=require('path');    //ejs
var methodOverride = require('method-override')
const { v4: uuidv4 } = require('uuid');


app.set("view engine","ejs")
app.set("views",path.join(__dirname,"/views"))

app.use(methodOverride('_method'))
app.use(express.urlencoded({extended:true}))

// create the connection to database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'delta_app',                              //delta_app is a database created in mysql in Delta file6
  password:'Root@123'
});

createRandomUser=() =>{                           // Used once to create 100 users using last for loop faker
  return [
    faker.string.uuid(),
     faker.internet.username(), 
     faker.internet.email(),
     faker.internet.password()
  ];
}

//Home Route
app.get('/',(req,res)=>{
 let q="select count(*) from user";
 connection.query(q,(err,result)=>{                          //Result madi count(*) which is curretnly 104 store hotay
  try {
    if (err)throw err
   let count= result[0] ['count(*)']   //result cha 0 index la { 'count(*)': 104 } aahe mg apun key (see down line) 
    res.render('home.ejs',{count})                                  //['count(*)'] array store karun values print keli 104.

  } catch (err) {
    res.send('Bad issue something happen')
  }
 })
})

//Show route (show username,Id,email)
app.get('/show',(req,res)=>{
  let q="select * from user";
  connection.query(q,(err,result)=>{
    try {
       if(err) throw err;
      res.render('show.ejs',{result});   //result show user
    } catch (error) {
      res.send('Bad issue something happen')
    }
})
})

//edit
app.get("/show/:Id/edit",(req,res)=>{
  let {Id}=req.params
 let q=`SELECT * FROM user where Id='${Id}'`
  connection.query(q,(err,result)=>{
  
    try {
      let user=result[0]
       if(err) throw err;
      res.render('edit.ejs',{user});   //result show edit page
    } catch (error) {
      res.send('Bad issue something happen')
    }
})
})

//update
app.patch("/show/:Id",(req,res)=>{
  let {Id}=req.params
  let {password:formpass, username:newusername}=req.body
 let q=`SELECT * FROM user where Id='${Id}'`
  connection.query(q,(err,result)=>{
    let user=result[0]
    try {
      if(err) throw err;
      if(formpass!= user.password){
        return res.send("wrong password")
      }else{
        let q2=`update user set username='${newusername}' where Id='${Id}' `
        connection.query(q2,(err,result)=>{
          if(err) throw err;
          res.redirect('/show')
        })
      }
      
    } catch (error) {
      res.send('Bad issue something happen')
    }
})
})

//add new
app.get("/show/new",(req,res)=>{
  res.render('new.ejs',)
})

//show newly added
app.post('/show',(req,res)=>{                          //fetchs the new data and redirect to home page
    let {Id,username,email,password}=req.body
    let q="INSERT INTO user (Id,username,email,password) values ? "
    let data=[]
    data.push([Id=uuidv4(),username,email,password])
   connection.query(q,[data],(err,result)=>{   
try {
    if (err) throw err
    console.log(result)
} catch (err) {
    console.log(err)
}}
)
    res.redirect('/show')
})

//delete
app.delete('/show/:Id', (req, res) => {
    let { Id } = req.params;
    console.log("Request received to delete ID:", Id); // ✅ log the ID

    let q = 'DELETE FROM user WHERE Id = ?';

    connection.query(q, [Id], (err, result) => {
        if (err) throw err;
        console.log("Delete result:", result); // ✅ log result object
        res.redirect('/show');
    });
});



app.listen(8080,()=>{
  console.log("server is listening at port 8080")
})

app.use((req,res)=>{
  res.send("wrong url")
})

/*let q="INSERT INTO user (id,username,email,password) values ?"

let data=[]
for(i=1;i<=100;i++){
   data.push(createRandomUser());
}

connection.query(q,[data],(err,result)=>{    //with faker 100 data entry
try {
    if (err) throw err
    console.log(result)
} catch (err) {
    console.log(err)
}}
)
connection.end()    */                                //to end connection after execution

