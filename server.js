const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.use('/public', express.static('public'));
//미들웨어. 요청과 응답 중간에 동작하는. 퍼블릭폴더 쓸거라고 명시

const methodOverride = require('method-override');
app.use(methodOverride('_method'));

const MongoClient = require('mongodb').MongoClient;

require('dotenv').config();

var db;
MongoClient.connect(process.env.DB_URL, function (err, client) {
    if (err) return console.log(err);
    db = client.db('todoapp');
    // db.collection('post').insertOne({ 이름: 'John', 나이: 20, _id: 100 }, function (err, result) {
    //     console.log('저장 완료');
    // });
    app.listen(process.env.PORT, function () {
        console.log('listening on 8080')
    });
});

app.get('/car', function (req, res) {
    res.send('자동차를 보여주는 페이지입니다.');
});
app.get('/photo', function (req, res) {
    res.send('사진을 보여주는 페이지입니다.');
});
app.get('/paint', function (req, res) {
    res.send('그림을 보여주는 페이지입니다.');
});

app.get('/setting', function (req, res) {
    res.send('관리자 페이지입니다.');
});

app.get('/', function (req, res) {
    res.render('index.ejs');
});
app.get('/write', function (req, res) {
    // res.sendFile(__dirname + '/views/write.ejs');
    res.render('write.ejs');
});

app.get('/list', function (req, res) {
    db.collection('post').find().toArray(function (err, result) {
        console.log(result);
        res.render('list.ejs', { posts: result });
    }); // 모든 데이터 가져오기 문법
});

app.get('/search', (req, res) => {
    // console.log(req); 요청에는 정보 다 담겨있음
    console.log(req.query);
    console.log(req.query.value);
    // toArray. Array 로 변환해주세요 함수
    var 검색조건 = [
        {
            $search: {
                index: 'titleSearch', // 몽고디비에 만든 서치 인덱싱 이름
                text: {
                    query: req.query.value,
                    path: "제목" // 제목 날짜 둘다 찾고 싶으면 ['제목', '날짜']
                }
            }
        },
        // { $sort: { _id: 1 } },
        // { $limit: 10 },
        // { $project: { 제목: 1, _id: 0, score: { $meta: "searchScore" } } }
    ];
    db.collection('post').aggregate(검색조건).toArray((err, result) => {
        console.log(result);
        res.render('search.ejs', { posts: result });
    })
});


// /: 적으면 뒤에 문자열 적었을 때 이거 실행해주세요. url parameter. 
app.get('/detail/:id', function (req, res) {
    db.collection('post').findOne({ _id: parseInt(req.params.id) }, function (err, result) {
        console.log(result);
        res.render('detail.ejs', { data: result });
    })
})

app.get('/edit/:id', function (req, res) {
    db.collection('post').findOne({ _id: parseInt(req.params.id) }, function (err, result) {
        console.log(result);
        res.render('edit.ejs', { post: result });
    });
})

app.put('/edit', function (req, res) {
    // 폼에 담긴 제목 날짜 데이터를 갖고
    // db.collection 에다가 업뎃함
    db.collection('post').updateOne({ _id: parseInt(req.body.id) }, { $set: { 제목: req.body.title, 날짜: req.body.date } }, function (err, result) {
        console.log('수정완료');
        res.redirect('/list');
    })
})


const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const res = require('express/lib/response');

app.use(session({ secret: '비밀코드', resave: true, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
// 미들웨어. 요청 응답 중간에 이런 코드가 동작. 

app.get('/login', function (req, res) {
    res.render('login.ejs')
})
app.post('/login', passport.authenticate('local', { failureRedirect: '/fail' }), function (req, res) {
    res.redirect('/')
});

app.get('/fail', function (req, res) {
    //  실패 페이지 기능개발
})

app.get('/mypage', detLogin, function (req, res) {
    console.log(req.user);
    res.render('mypage.ejs', { 사용자: req.user });
})

function detLogin(req, res, next) {
    if (req.user) {
        next();
    }
    else {
        res.send('you are NOT Logged in.');
    }
}
//미들웨어

passport.use(new LocalStrategy({
    usernameField: 'id',
    passwordField: 'pw',
    session: true,
    passReqToCallback: false,
}, function (입력한아이디, 입력한비번, done) {
    console.log(입력한아이디, 입력한비번);
    db.collection('login').findOne({ id: 입력한아이디 }, function (에러, 결과) {
        if (에러) return done(에러)

        if (!결과) return done(null, false, { message: '존재하지않는 아이디요' })
        if (입력한비번 == 결과.pw) {
            return done(null, 결과)
        } else {
            return done(null, false, { message: '비번틀렸어요' })
        }
    })
}));

passport.serializeUser(function (user, done) {
    done(null, user.id)
});
// id를 이용해서 세션을 저장시키는 코드. 로그인 성공시 발동
passport.deserializeUser(function (아이디, done) {
    // deserializeUser. db 에서 user.id 로 유저를 찾은 뒤에 유저 정보를 아래 {} 에 넣음
    db.collection('login').findOne({ id: 아이디 }, function (err, result) {
        done(null, result)
    });
});
// 이 세션 데이터를 가진 사람을 db에서 찾아주세요. 마이페이지 접속시 발동.



app.post('/register', function (req, res) {
    db.collection('login').insertOne({ id: req.body.id, pw: req.body.pw }, function (err, result) {
        res.redirect('/');
    });
});


app.post('/add', function (req, res) {

    res.send('submit complete');
    console.log(req.body);
    db.collection('counter').findOne({ name: '게시물갯수' }, function (err, result) {
        console.log(result.totalPost);
        var postNum = result.totalPost;
        var 저장할거 = { _id: postNum + 1, 작성자: req.user._id, 제목: req.body.title, 날짜: req.body.date };
        db.collection('post').insertOne(저장할거, function (err, result) {
            console.log('저장 완료');
            db.collection('counter').updateOne({ name: '게시물갯수' }, {
                $inc: { totalPost: 1 }
            }, function (err, result) {
                if (err) { return console.log(err) };
            });
        });
    });
})


app.delete('/delete', function (req, res) {
    console.log('삭제요청 들어옴');
    console.log(req.body);
    req.body._id = parseInt(req.body._id);
    // object 자료 다루기
    var 삭제할데이터 = { _id: req.body._id, 작성자: req.user._id };

    db.collection('post').deleteOne(삭제할데이터, function (err, result) {
        console.log('삭제 완료');
        if (err) { console.log(err) };
        res.status(200).send({ message: '성공했습니다' });
        // ajax jQuery 문법 쓰기 위해서는 서버는 꼭 응답 보내줘야 함
    });
})

app.use('/shop', require('./routes/shop.js'));
// app.use : 미들웨어 사용시. 요청과 응답사이 이런코드 실행 원할때.
app.use('/board/sub', require('./routes/board.js'));

let multer = require('multer');
var _storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/image')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname + '날짜' + new Date());
    },
    // filefilter: function (req, file, cb) {
    //     var ext = path.extname(file.originalname);
    //     if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
    //         return cb(new Error('PNG, JPG, JPEG 확장자 파일만 업로드하세요'))
    //     }
    // },
    // limits: {
    //     filesize: 1024 * 1024
    // }
});

var upload = multer({ storage: _storage });

app.get('/upload', function (req, res) {
    res.render('upload.ejs')
})

//이 역시 미들웨어로. 페이지 로드하면 업로드 함수 실행되게.
// upload.ejs 의 input 태그 옵션을 multiple로 적고 아래 upload.array(, 10) 시 10개 동시 업로드 가능. 아랫줄은 하나의 파일만 업로드.
// app.post('/upload', upload.array('profile', 10), function (req, res) {
app.post('/upload', upload.single('profile'), function (req, res) {
    res.send('업로드 완료');
});

// : 쓰면 파라미터 url 문법.
app.get('/image/:imageName', function (req, res) {
    res.sendFile(__dirname + '/public/image/' + req.params.imageName)
})