var webshot = require('webshot'),
    express = require('express'),
    app = express(),
    crypto = require('crypto'),
    fs = require('fs');

app.get('/', function (req, res) {
    var url = req.query.url,
        urlHash = crypto.createHash('md5').update(url).digest('hex'),
        imgPath = 'screenshots/' + urlHash + '.png',
        options = {
            phantomConfig: {
                'ignore-ssl-errors': 'true',
                'ssl-protocol': 'any'
            },
            quality: 100,
            renderDelay: 2000
        };

    console.log(url, urlHash, imgPath);

    if (fs.existsSync(imgPath)) {
        res.setHeader('content-type', 'image/png');
        fs.createReadStream(imgPath).pipe(res);
    } else {
        webshot(url, imgPath, options, function (err) {
            if (err) {
                res.status(500);
                res.send('An error occured: ' + err);
                console.error(err);
            } else {
                res.setHeader('content-type', 'image/png');
                fs.createReadStream(imgPath).pipe(res);
            }
        });
    }
});

app.listen(2341);
