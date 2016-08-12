var agent = require('./common').agent;
var Describe = require('./common').Describe;
var expireTime = 60000;



function ImportDescribe(name, path){
	Describe(name, function(){
		require(path);
	});
}

describe('Index', function(){
	this.timeout(expireTime);

    ImportDescribe('', './user-service-test');
    ImportDescribe('', './api-test');

	after(function(){
		console.log('All cases are finished');
	});
});
