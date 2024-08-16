const express = require('express');
const path = require('path');

const { PORT } = require('./config.js');

let app = express();
app.use(express.static('wwwroot'));
app.use(express.static(path.join(__dirname, 'home')));

app.get('/', (req, res)=> {
    res.sendFile(path.join(__dirname, 'wwwroot', 'index.html'))
})
app.use(require('./routes/auth.js'));
app.use(require('./routes/models.js'));



app.get('/dash', (req, res) => {
    res.sendFile(path.join(__dirname, 'home', 'index.html'))
});

app.listen(PORT, function () { console.log(`Server listening on port ${PORT}...`); });