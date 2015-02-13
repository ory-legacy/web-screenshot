var webshot = require('webshot'),
    express = require('express'),
    app = express(),
    crypto = require('crypto'),
    fs = require('fs'),
    lwip = require('lwip');

app.get('/', function (req, res) {
    var url = req.query.url,
        scale = req.query.scale ? req.query.scale : '1',
        urlHash = crypto.createHash('md5').update(url + '-scale:1').digest('hex'),
        imgHash = crypto.createHash('md5').update(url + '-scale:' + scale).digest('hex'),
        imgOriginalPath = 'screenshots/' + urlHash + '.png',
        imgPath = 'screenshots/' + imgHash + '.png',
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
        webshot(url, imgOriginalPath, options, function (err) {
            if (err) {
                res.status(500);
                res.send('An error occured: ' + err);
                console.error(err);
            } else {
                res.setHeader('content-type', 'image/png');

                if (fs.existsSync(imgPath)) {
                    fs.createReadStream(imgPath).pipe(res);
                } else {
                    lwip.open(imgOriginalPath, function (err, image) {
                        image.batch()
                            .scale(parseFloat(scale))
                            .writeFile(imgPath, function (err) {
                                if (err) {
                                    res.status(500);
                                    res.send('An error occured: ' + err);
                                    console.error(err);
                                    return;
                                }
                                fs.createReadStream(imgPath).pipe(res);
                            });
                    });
                }
            }
        });
    }
});

app.listen(2341);
