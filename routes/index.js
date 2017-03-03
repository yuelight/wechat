var express = require('express');
var router = express.Router();
var crypto = require('crypto');

/* GET home page. */
router.get('/wechat/hello', function(req, res, next) {
    res.render('index', { title: 'Hello Wechat from Aliyun ECS --> Express' });
});

const token = 'dmIKhkJ65yZ4cdLGWU40';

const handleWechatRequest = function(req, res, next) {
    const { signature, timestamp, nonce, echostr } = req.query;

    if (!signature || !timestamp || !nonce) {
        return res.send('Invalid request!');
    }
    if (req.method === 'POST') {
        console.log('handleWechatRequest.post: \n');
        console.log('body: ', req.body);
        console.log('query: ', req.query);
    }
    if (req.method === 'GET') {
        console.log('handleWechatRequest.GET', { get: req.body });
        if (!echostr) {
            return res.send('Invalid request!');
        }
    }

    const params = [token, timestamp, nonce];
    params.sort();

    const hash = crypto.createHash('sha1');
    const sign = hash.update(params.join('')).digest('hex');

    if (signature === sign) {
        if (req.method === 'GET') {
            res.send(echostr ? echostr : 'Invalid request!');
        } else {
            const tousername = req.body.xml.tousername[0].toString();
            const fromusername = req.body.xml.fromusername[0].toString();
            const createtime = Math.round(Date.now() / 1000);
            const msgtype = req.body.xml.msgtype[0].toString();
            const content = req.body.xml.content[0].toString();
            const msgid = req.body.xml.msgid[0].toString();


            const response = `<xml>
                    <ToUserName><![CDATA[${fromusername}]]></ToUserName>
                    <FromUserName><![CDATA[${tousername}]]></FromUserName>
                    <CreateTime>${createtime}</CreateTime>
                    <MsgType><![CDATA[${msgtype}]]></MsgType>
                    <Content><![CDATA[${content}]]></Content>
                </xml>`;
            res.set('Content-Type', 'text/xml');
            res.send(response);
        }
    } else {
        res.send('Invalid sign!');
    }
};

router.get('/api/wechat', handleWechatRequest);
router.post('/api/wechat', handleWechatRequest);

module.exports = router;
