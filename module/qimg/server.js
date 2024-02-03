import path from 'path';
import fs from 'fs-extra';
import express from 'express';
import pug from 'pug';

export default async function server(data) {

    const __dirname = path.resolve();
    const app = express();
    const port = 3000;

    app.use(express.static(__dirname + '/module/qimg/html'));

    app.get('/', (req, res) => {
        const pugPath = path.join(__dirname, "module", "qimg", "html", 'index.pug');
        const render = pug.renderFile(pugPath, data);
        res.send(render);
    });

    const startServer = app.listen(port, () => {
        console.log(`Example app listening on port http://localhost:${port}`)
    });

    startServer

    return startServer;

}