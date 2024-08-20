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

app.get('/blender', (req, res) => {
    res.sendFile(path.join(__dirname, 'components', 'blend.html'));
});

app.get('/mainsupport', (req, res) => {
    res.sendFile(path.join(__dirname, 'components', 'main_support1_1.html'));
});
app.get('/doors', (req, res) => {
    res.sendFile(path.join(__dirname, 'components', 'doors1_2.html'));
});

app.get('/3d/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'wwwroot', 'index.html'));
});

app.get('/inventory', (req, res) => {
    res.sendFile(path.join(__dirname, 'inventory', 'index.html'))
})

// Additional route handling
app.use(require('./routes/auth.js'));
app.use(require('./routes/models.js'));

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});