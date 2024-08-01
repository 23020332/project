const express = require("express");
const mysql = require("mysql2");
const multer = require("multer");
 
const app = express();
 
// create my sql connection
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "c237_recipe"
});
connection.connect((err) => {
    if (err) {
        console.error("Error connecting to MySQL:", err);
        return;
    }
    console.log("Connected to MySQL database");
});
 
// for image upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/images");
    },
    filename: (req, file, cb) =>{
        cb(null, file.originalname);
    }
});
const upload = multer({storage: storage});
 
//import the express.js framework
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
 
//set up view engine
app.set("view engine", "ejs");
// enable static files
app.use(express.static("public"));
app.use(express.urlencoded({
    extended: false
}));

// retrieve all products
app.get("/", (req, res) => {
    const sql = "SELECT * FROM recipe";
    connection.query(sql, (error, results)=> {
        if(error){
            console.error("Database query err: ", error.message);
            return res.status(500).send("Err retrieving recipe");
        }
        res.render("index", {recipes: results});
    });
});

//retrieve product by id
// trigger from index.ejs
app.get ("/recipe/:id", (req, res) =>{
    const id = req.params.id;
    connection.query("SELECT * FROM recipe WHERE id = ?",
    [id], (error, results)=>{
        if(error) throw error;
        if(results.length > 0){
            res.render("recipe", {recipe:results[0]});
        }else{
            res.status(404).send("Recipe not found")
        }
    });
});

//add a product
app.get("/addRecipe", (req, res) =>{
    res.render("addRecipes")
});

app.post("/addRecipe", upload.single("image"), (req, res) => {
    const {name, description, ingredient, instruction} = req.body;
    let image;
    if (req.file){
        image = req.file.filename
    }else{
        image=null;
    }
    console.log(image);
    connection.query("INSERT INTO recipe(name, description, ingredient, instruction, image) VALUES (?, ?, ?, ?, ?)",
    [name, description, ingredient, instruction, image], (error, results) =>{
        if (error){
            console.error("Err adding recipe", error);
            res.status(500).send("Error adding recipe");
        }else{
            res.redirect("/");
        }
    });
});

//edit a product
app.get("/editRecipe/:id", (req, res) => {
    const id = req.params.id;

    const sql = "SELECT * FROM recipe WHERE id = ?";
    connection.query(sql, [id], (error, results)=>{
        if(error){
            console.error("Database query error:", error.message);
            return res.status(500).send("Error retrieving product");
        }
        if (results.length > 0){
            res.render("editRecipe", {recipe: results[0]});
        }else{
            res.status(404).send("Recipe not found");
        }
    })
})

app.post("/editRecipe/:id", upload.single("image"), (req, res) => {
    const id = req.params.id;
    const {name, description, ingredient, instruction} = req.body;
    let image = req.body.currentImage;
    if (req.file){
        image = req.file.filename;
    }
    const sql = "UPDATE recipe SET name=?, description=?, ingredient=?, instruction=?, image=? WHERE id=?";
    connection.query(sql, [name, description, ingredient, instruction, image, id], (error,result)=>{
        if (error){
            console.error("Database query error:", error.message);
            return res.status(500).send("Error retrieving recipe");
        }else{
            res.redirect("/");
        }
    })
})

//delete a product
app.get("/deleteRecipe/:id", (req, res) => {
    const id = req.params.id;

    const sql = "DELETE FROM recipe WHERE id = ?";
    connection.query(sql, [id], (error, results)=>{
        if (error){
            console.error("Database query error:", error.message);
            return res.status(500).send("Error deleting recipe");
        }else{
            res.redirect("/")
        }
    })
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));