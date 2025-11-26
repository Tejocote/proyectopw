const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path');
const routes = require('./routes/routes');

const app = express();

// servir archivos estáticos desde /public
app.use(express.static(path.join(__dirname, 'public')));

// analizar los datos del cuerpo del formulario
app.use(bodyParser.urlencoded({extended:false}));

// configuracion de el motor de plantillas
app.set('view engine','ejs');

// configuracion de mi DB
const db = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'Tuculucupende12.',
    database:'node_crud',
    port:'3306'
});

// validacion de db
db.connect(err=>{
    if(err){
        console.error('ocurrió un error con el servidor: ',err);
    }else{
        console.log('Server no llama feliz');
    }
});

// usar rutas
app.use(routes(db));

// servidor
const port = 3009;
app.listen(port,()=>{
    console.log(`server desde http://127.0.0.1:${port}`);
});