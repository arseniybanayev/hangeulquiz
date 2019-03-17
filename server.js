const path = require('path');
const express = require('express');

module.exports = {
    app: function () {
        const app = express();
        const publicPath = express.static(path.join(__dirname, 'public'));

        app.use('/public', publicPath);

        app.get('*', (req, res) => {
            res.sendFile(path.resolve(__dirname, 'index.html'));
        });

        return app
    }
};