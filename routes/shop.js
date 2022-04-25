var router = require('express').Router();
// 들여올 파일 또는 라이브러리명

function detLogin(req, res, next) {
    if (req.user) {
        next();
    }
    else {
        res.send('you are NOT Logged in.');
    }
}
//미들웨어
router.use('/shirts', detLogin);

router.get('/shirts', function (req, res) {
    res.send('셔츠 파는 페이지입니다.');
});
router.get('/pants', function (req, res) {
    res.send('바지 파는 페이지입니다.');
});

module.exports = router;
// 내보낼 변수명