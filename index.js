const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path'); // <-- agregado

const app = express();

// servir archivos estáticos desde /public
app.use(express.static(path.join(__dirname, 'public'))); // <-- agregado

// analizar los datos del cuerpo del formulario que viene desde el html
// informacion que mandaremos por metodos como POST o GET
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
        console.error('server: llama',err);
    }else{
        console.log('Server no llama feliz');
    }
});

// mostrar la lista de los usuario:
app.get('/',(req,res)=>{
    // consulta
    const consulta = 'SELECT * FROM users';
    db.query(consulta,(err,results)=>{
       if(err){
        console.error('error en la consulta',err);
        res.send('Error, no se pueden recuperar datos');
       }else{

            res.render('index',{users: results });
       } 
    });
});

// --- NUEVA RUTA: agregar usuario ---
app.post('/add', (req, res) => {
    const name = (req.body.name || '').trim();
    const email = (req.body.email || '').trim();

    if (!name || !email) {
        return res.status(400).send('Nombre y correo son requeridos');
    }

    const sql = 'INSERT INTO users (name, email) VALUES (?, ?)';
    db.query(sql, [name, email], (err, result) => {
        if (err) {
            console.error('Error al insertar user:', err);
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).send('El correo ya existe');
            }
            return res.status(500).send('Error al guardar usuario');
        }
        return res.redirect('/');
    });
});

// --- RUTA: eliminar usuario ---
app.get('/delete/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).send('ID inválido');

    const sql = 'DELETE FROM users WHERE id = ?';
    db.query(sql, [id], (err) => {
        if (err) {
            console.error('Error al eliminar user:', err);
            return res.status(500).send('Error al eliminar usuario');
        }
        return res.redirect('/');
        
    });
});

// --- RUTA: mostrar formulario de edición ---
app.get('/edit/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).send('ID inválido');

    db.query('SELECT * FROM users WHERE id = ?', [id], (err, results) => {
        if (err) {
            console.error('Error al obtener user:', err);
            return res.status(500).send('Error al obtener usuario');
        }
        if (!results.length) return res.status(404).send('Usuario no encontrado');
        return res.render('edit', { user: results[0] });
    });
});

// --- RUTA: procesar edición ---
app.post('/edit/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const name = (req.body.name || '').trim();
    const email = (req.body.email || '').trim();
    if (Number.isNaN(id) || !name || !email) return res.status(400).send('Datos inválidos');

    const sql = 'UPDATE users SET name = ?, email = ? WHERE id = ?';
    db.query(sql, [name, email, id], (err) => {
        if (err) {
            console.error('Error al actualizar user:', err);
            if (err.code === 'ER_DUP_ENTRY') return res.status(409).send('El correo ya existe');
            return res.status(500).send('Error al actualizar usuario');
        }
        return res.redirect('/');
    });
});

//servidor
const port = 3009;
app.listen(port,()=>{
    console.log(`server desde http://127.0.0.1:${port}`);
});