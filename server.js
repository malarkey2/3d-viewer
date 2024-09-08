const express = require('express');
const path = require('path');
const { PORT } = require('./config.js');

let app = express();

// Serve static files
app.use(express.static(path.join(__dirname, 'home')));
app.use(express.static(path.join(__dirname, 'wwwroot')));

// Route handlers
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'home', 'index.html'));
});

app.get('/flywheel', (req, res) => {
    res.sendFile(path.join(__dirname, 'components', 'flywheel.html'));
});


app.get('/3d/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'wwwroot', 'index.html'));
});



// Additional route handling
app.use(require('./routes/auth.js'));
app.use(require('./routes/models.js'));

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});