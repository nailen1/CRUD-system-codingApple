const express = require('express');
const app = express();

app.listen(8080, function() {
    console.log('listening on 8080')
});

// 누군가가 /pet 으로 방문을 하면, pet 관련 안내문을 띄워주자.
// app.get('/car', function(req, request) {
//     request.send('진리의 자동차를 보여주는 페이지입니다.');
// });
app.get('/car', (req, response) => {
    response.send('진리의 자동차를 보여주는 페이지입니다.');
});
app.get('/photo', function(req, response) {
    response.send('진리의 사진을 보여주는 페이지입니다.');
});
app.get('/paint', function(req, response) {
    response.send('진리의 그림을 보여주는 페이지입니다.');
});

app.get('/setting', function(req, response) {
    response.send('관리자 페이지입니다.');
});

app.get('/', function(req, response) {
    response.sendFile(__dirname + '/index.html');
    // response.sendFile(__dirname + '/schrodingers-cat.css');
    // response.sendFile(__dirname + '/cat-in-ket-alive.svg');
    // response.sendFile(__dirname + '/cat-in-ket-dead.svg');
});
app.get('/write', function(req, response) {
    response.sendFile(__dirname + '/write.html');
});

// 어떤 사람이 /add 경로로 POST 요총을 하면... 뭐뭐를 해주세요.
app.post('/add', (req, response) => {
    response.send('submit complete');
})