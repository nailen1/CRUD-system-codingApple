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

router.use(detLogin);

router.get('/sports', function (req, res) {
    res.send('스포츠 게시판');
});
router.get('/game', function (req, res) {
    res.send('게임 게시판');
});

module.exports = router;
// 내보낼 변수명