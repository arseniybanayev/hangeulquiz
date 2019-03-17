const Server = require('./server.js');
const port = (process.env.PORT || 8080);
const app = Server.app();

app.listen(port);
process.noDeprecation = true;
console.log(`Listening at http://localhost:${port}`);