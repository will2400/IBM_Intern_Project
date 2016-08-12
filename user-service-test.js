var expect = require('./common').expect;
var agent = require('./common').agent;
var _ = require("underscore");
var Describe = require('./common').Describe;
var IT = require('./common').IT;
var ibmdb = require('ibm_db');
var cn = "DRIVER={DB2};DATABASE=rpo_dev;UID=db2inst1;PWD=Aq1sw2de;HOSTNAME=9.3.68.168;port=50000"

var comp1 = ['Quintiles',
 			 'Covance',
 			 'ICON',
 			 'PRA Health',
			 'INC Research',
			 'Pharmaceutical Product Development',
			 'inVentiv Health'];

var comp2 = ['Covance',
			 'ICON',
			 'PRA Health',
			 'INC Research',
			 'Pharmaceutical Product Development',
			 'inVentiv Health'];

var pagel = ['dash.authenticated.requisitions.all',
			'dash.authenticated.social.reviews',
			'dash.authenticated.summary', 
			'dash.authenticated.data',
			'dash.authenticated.feedback',
			'dash.authenticated.admin.users',
			'dash.authenticated.override']


Describe('USER-SERVERS-TEST-CASES', function(){
	IT('Clear and Insert Data',function(done){
		ibmdb.open(cn,function(err,conn){
		flag = 0;
		cnt = 3;
		function Count(){
			flag += 1;
			if(cnt == flag){
        		agent.post('logout')
             	.send({})
             	.end(function(err, res){
                done();
             	});
			}
		}
        conn.prepare("DELETE FROM USERS.USERCOMPANY where USERNAME='test1@cn.ibm.com'  ", function (err, stmt) {
            stmt.execute(function (err, result) {   
            	Count();
            });
        });
		conn.prepare("INSERT into USERS.USERCOMPANY(COMPANYID, USERNAME) VALUES (?, ?)", function (err, stmt) {
			stmt.execute(['1', 'test1@cn.ibm.com'], function (err, result) {
				Count();
			});
			stmt.execute(['2', 'test1@cn.ibm.com'], function (err, result) {
				Count();
                });
            });    
        });
	}); 


	Describe('Cases with expected clients', function(){
		IT('should return correct response', function(done){
			agent.get('user/*')
			.end(function(err, res){
				expect(err).to.equal(null);
				expect(res.status).not.to.equal('401')
				done();
			});
		});

		it('Default client', function(done){
			agent.get('user/defaultClient')
			.end(function(err,res){
				expect(err).to.equal(null);
				expect(res.body['clientId']).to.equal('1');
				var isEqual = _.isEqual(res.body['competitors'], comp1); 
 				expect(isEqual).to.be.true;	
 				done();
			});
		});
	
		it('Should retrun correct CurrentClient (Before Switch)', function(done){
			agent.get('user/currentClient')
			.end(function(err, res){
				expect(err).to.equal(null);
				expect(res.body['clientId']).to.equal('1');
				var isEqual = _.isEqual(res.body['competitors'], comp1); 
 				expect(isEqual).to.be.true;	
 				done();
			});	
		});

		it('Should return correct clients', function(done){
			agent.get('user/clients')
			.end(function(err, res){
				expect(err).to.equal(null);
				var clts = {1:'Parexel', 2:'UHG'};
				var isEqual = _.isEqual(res.body, clts); 
 				expect(isEqual).to.be.true;
				done();
			});
		});

		it('Should switch to client 1', function(done){
			agent.post('user/switchClient')
			.send({'clientId' : '1'})
			.end(function(err, res){
				expect(err).to.equal(null);
				expect(res.body['clientId']).to.equal('1');
				var isEqual = _.isEqual(res.body['competitors'], comp1); 
 				expect(isEqual).to.be.true;
				done();	
			});
		});

		it('Should switch to client 2', function(done){
			agent.post('user/switchClient')
			.send({'clientId' : '2'})
			.end(function(err, res){
				expect(err).to.equal(null);
				expect(res.body['clientId']).to.equal('2');
				var isEqual = _.isEqual(res.body['competitors'], comp2); 
 				expect(isEqual).to.be.true;
				done();
			});
		});

		it('should switch to client 3', function(done){
			agent.post('user/switchClient')
			.send({'clientId' : '3'})
			.end(function(err, res){
				expect(err).to.equal(null);
				expect(res.status).to.equal(403);
				expect(res.body['error']).to.equal('Forbidden');
				done();			
			});
		});

		it('should retrun CurrentClient (After Switch)', function(done){
			agent.get('user/currentClient')
			.end(function(err, res){
				expect(err).to.equal(null);
				expect(res.body['clientId']).to.equal('2');
				var isEqual = _.isEqual(res.body['competitors'], comp2); 
 				expect(isEqual).to.be.true;
 				done();
			});	
		});

		it('Should retrun pageList', function(done){
			agent.get('user/pages')
			.end(function(err,res){
				expect(err).to.equal(null);
				var isEqual = _.isEqual(res.body, pagel); 
 				expect(isEqual).to.be.true;
				done();
			});
		});
	});

	Describe('Cases with non-expected clients', function(){
		IT('Delete all data',function(done){
			ibmdb.open(cn,function(err,conn){
			flag = 0;
			cnt = 1;
			function Count(){
				flag += 1;
				if(cnt == flag){
        			agent.post('logout')
					.send({})
					.end(function(err, res){
						done();
					});
				}
			}
        		conn.prepare("delete FROM USERS.USERCOMPANY where USERNAME='test1@cn.ibm.com'  ", function (err, stmt) {
            		stmt.execute(function (err, result) { 
            			Count();
					});
				});
        	}); 
        });

		Describe('CurrentClient (With No client)', function(){
			IT('Should return correct clients', function(done){
				agent.get('user/clients')
				.end(function(err, res){
					done();
				});
			});

			IT('retrun CurrentClient', function(done){
            	agent.get('user/currentClient')
				.end(function(err, res){
					expect(res.status).to.equal(901);
					expect(res.body['message']).to.equal('No Client Found');
					done();
				});	
			});		
		});
	});
});
