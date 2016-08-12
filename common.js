var request = require('supertest');
var agent = request.agent('http://localhost:2000/');
var expect = require('chai').expect;
var username = 'test1@cn.ibm.com';
var password = 'i0g^J4pg';


function Describe(name, f){
    before(function(done){
        agent.post('login')
            .send({username : username, password : password})
            .end(function(err, res){
                done();
             });
    });

    describe(name, f);

    after(function(){

    });
}

function IT(name, f){
    before(function(done){
        agent.post('login')
            .send({username : username, password : password})
            .end(function(err, res){
                done();
             });
    });

    it(name, f);

    after(function(){

    });
}

module.exports.agent = agent;
module.exports.expect = expect;
module.exports.Describe = Describe;
module.exports.IT = IT;
