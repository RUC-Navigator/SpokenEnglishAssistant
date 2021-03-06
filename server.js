var express = require('express');
var fs = require('fs');
var ai = require('./ai.js');
var case1 = require('./case1.js');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

var app = express();

var public_PATH = 'public';			// 文件路径
var UPLOAD_PATH = public_PATH + '/uploads/';	// 上传文件目录
var OUT_PATH = public_PATH + '/out/';			// 处理后生成文件的目录

// ROUTES
app.get('/', function (req, res) {
  res.sendFile('public/index.html', {root: './'});
});

// case 1: fixed script
// the user post an audio and the script
// return the errors words and href of the word
app.post('/src/1_postaudio', multipartMiddleware, function (req, res) {

	// 存文件
	var fname = req.body.fname || 'file' + Math.floor(Math.random() * 1000000) + '.wav';
	var script = req.body.txt;
	var filedata = req.body.data;

	// should be comment
	//script = 'what a lovely day, isn\'t it';

	var data = filedata.substr(filedata.indexOf(',') + 1);

	var b = new Buffer(data, 'base64');
	var filepath = UPLOAD_PATH + 'case1/' + fname;
	
	fs.writeFile(filepath, b, 'binary',function (err) {
		if (err) {
			console.log(err);
			res.json({
				status: -1,
				msg: err
			});
		} else {
			res.json({
				status: 0,
				msg: 'success',
				id: fname
			});
			// 处理
			case1_fixedscript(filepath, script);
		}
	});
});

function case1_fixedscript(filepath, script) {
	var fname = getFileName(filepath);
	var rfname = fname.substring(0,fname.length-4);
	var outputpath = OUT_PATH + 'case1/' + rfname + '_out.txt';
	case1(filepath, outputpath, script);
}

// 轮询，如果文件已生成，返回status 0及word error
app.get('/src/1_getresult', function (req, res) {
	var fname = getFileName(req.query.id);
	var rfname = fname.substring(0,fname.length-4);
	var worderror = OUT_PATH + 'case1/' + rfname + '_out.txt';

	fs.exists(worderror, function (exists) {
		if (exists) {
			fs.readFile(worderror, 'utf-8', function (err, outscript) {
				if (err) {
					console.log(err);
				}
				res.json({
					status: 0, 
					txt: outscript,
				});
			});			
		} else {
			res.json({statu: -1, msg: '请稍候'});
		}
	});
});

// case 3: free conversation
// the user post an audio, and then generate the transcription of the audio
// and the response audio with its transcription
app.post('/src/3_postaudio', multipartMiddleware, function (req, res) {
	// 存文件
	var fname = req.body.fname || 'file' + Math.floor(Math.random() * 1000000) + '.wav';
	var filedata = req.body.data;

	var data = filedata.substr(filedata.indexOf(',') + 1);

	var b = new Buffer(data, 'base64');
	var filepath = UPLOAD_PATH + 'case3/' + fname;
	
	fs.writeFile(filepath, b, 'binary',function (err) {
		if (err) {
			console.log(err);
			res.json({
				status: -1,
				msg: err
			});
		} else {
			res.json({
				status: 0,
				msg: 'success',
				id: fname
			});
			// 处理
			case3_freeconv(filepath);
		}
	});
});

// 轮询，如果文件已生成，返回status 0及文件路径
app.get('/src/3_getresult', function (req, res) {
	var fname = getFileName(req.query.id);
	var rfname = fname.substring(0,fname.length-4);
	var outwave = OUT_PATH + 'case3/' + fname;
	var transcipt = OUT_PATH + 'case3/' + rfname;

	fs.exists(outwave, function (exists) {
		if (exists) {
			fs.readFile(transcipt+'_upload.txt', 'utf-8', function (err, uploadscript) {
				if (err) {
					console.log(err);
				}
				fs.readFile(transcipt+'_out.txt', 'utf-8', function (err, outscript) {
					res.json({
						status: 0, 
						path: outwave.replace('public', ''),
						txt: outscript,
						pre: uploadscript
					});
				});
			});			
		} else {
			res.json({statu: -1, msg: '请稍候'});
		}
	});
});

// 处理上传来的音频文件并输出生成文件
getFileName = function (filepath) {
	// console.log('filepath', filepath);
	if (filepath!=undefined) {
		var fname = filepath.split('/');
		fname = fname[fname.length - 1];
		return fname;
	}
};

function case3_freeconv(filepath) {
	var fname = getFileName(filepath);
	var rfname = fname.substring(0,fname.length-4);
	var outputpath = OUT_PATH + 'case3/' + rfname;
	var ftranscipt = OUT_PATH + 'case3/' + rfname + '_upload.txt';
	ai(filepath, ftranscipt, outputpath);
}


app.use(express.public(public_PATH));

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Server listening at http://%s:%s', host, port);
});
