/*
- Go to the group chat settings and email yourself the chat log 
  (no attachments), use that txt here.
  (You'll need an android phone or some tweaking of the regex on 
  line 11 to make this work.)
  
- You might also need to create a /us folder for the --export 
  option to work but let's not get ahead of ourselves here. 
  You still havent even sent yourself the log, have you?
*/
var latinize = require('latinize'); /*npm install latinize*/
var fs       = require('fs');

var file     = fs.readFileSync('chat.txt');

var lines    = file.toString().split("\n");
var users    = {};

lines.map(function(line){
	var userArr = line.match(/-\ (.*?)\:(.*)?/);
	if(userArr === null || typeof userArr !== 'object') {
		return;
	}
	if(userArr[1].indexOf(' ') < 0) {
		var user = userArr[1].toLowerCase();
	}
	else {
		var user = userArr[1].toLowerCase().substr(0,userArr[1].indexOf(' '));	
	}
	
	if(!users[user]){
		users[user] = [];
	}
	users[user].push(userArr[2]);
})

function pad(num, size) {
    var s = num+"";
    while (s.length < size) s = " " + s;
    return s;
}




function countWords(string){
	if(typeof string === 'object'){
		string = string.join(' ');
	}
		
	var wordkeys = {};
	var words = string.split(' ');
	words.map(function(word){
		word = word.toLowerCase();
		if(!wordkeys[word]) wordkeys[word] = 0;
		wordkeys[word]++;	
	});
	
	return wordkeys;
}
function getWordList(words){
	words = latinize(words.join(' ')).replace(/\s\s+/g, ' ').replace(/[\!\?\¡\¿\,\;\"]/g,'').split(' ').filter(function(word){
		return word.length > 1;
	});
	var keys = countWords(words);
	
	var sortable = [];
	for (var key in keys) sortable.push([key, keys[key]])
	sortable.sort(function(a, b) {return a[1] - b[1]})
	
	var rt = [];
	sortable.map(function(arr){
		rt.push(pad(Math.round(arr[1]/words.length*100000)/1000,6)+'%; '+pad(arr[1],5)+'; '+arr[0]);
	})
	
	return rt;
}




if(process.argv[2] === '--list') {
	console.log(Object.keys(users));
}
if(process.argv[2] === '--all') {
	var all = [0];
	for(var user in users){
		all.push.apply(all,users[user]);
	}
	console.log(getWordList(all).join("\n"));
}
else if(process.argv[2] === '--export') {
	var all = [];
	for(var user in users){
		fs.writeFileSync('us/'+user+'.csv', getWordList(users[user]).join("\n"), 'utf-8');
		all.push.apply(all,users[user]);
	}
	fs.writeFileSync('us/all.csv', getWordList(all).join("\n"), 'utf-8');
}
else {
	console.log(getWordList(users[process.argv[2]]).join("\n"));
}