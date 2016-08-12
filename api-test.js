var expect = require('./common').expect;
var agent = require('./common').agent;
var _ = require("underscore");
var Describe = require('./common').Describe;
var IT = require('./common').IT;
var ibmdb = require('ibm_db');
var cn = "DRIVER={DB2};DATABASE=rpo_dev;UID=db2inst1;PWD=Aq1sw2de;HOSTNAME=9.3.68.168;port=50000"


Describe('API-TEST-CASES', function(){
	it('Clear and Insert Data',function(done){
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
		IT("Check every API request (need currentClient) ",function(done){
			agent.get('api/*')
			.end(function(err,res){
				expect(err).to.equal(null);
				expect(res.status).not.to.equal('403');
				done();
			});
		});	

		it("Should return correct config",function(done){
			agent.get('api/config')
			.end(function(err,res){
				expect(err).to.equal(null);
				var config = {name: 'IBM RPO Cognitive Suite', build: '1.0.5'};
				var isEqual = _.isEqual(res.body, config); 
 				expect(isEqual).to.be.true;
				done();
			});
		});

		it("check coresponing client",function(done){
			agent.get('api/theme/Parexel')
			.end(function(err,res){
				expect(err).to.equal(null);
				//console.log(res.body);
				//expect(res.body['clientId']).to.equal('1');
				var isEqual = _.isEqual(res.body['competitors'], comp1); 
 				expect(isEqual).to.be.true;	
				done();
			});
		});


		it("check reqNum",function(done){
			agent.get('api/req/pare-10051080')
			.end(function(err,res){
			//console.log(res.body);
			var isEqual = _.isEqual(res.body['data'], expdata); 
 				expect(isEqual).to.be.true;	
				done();
			});
		});

		it("check specific req_num's score",function(done){
			agent.get('api/req/pare-10051080/scores')
			.end(function(err,res){
				//console.log(res.body['data'][0]["DRIVERS"]);
				var isEqual = _.isEqual(res.body['data'][0]["DRIVERS"], scoredata); 
 				expect(isEqual).to.be.true;	
				done()
			});
		});

		it("check performance",function(done){
			agent.get('api/req/pare-10051080/performance')
			.end(function(err,res){
				//console.log(res.body['data']);
				var isEqual = _.isEqual(res.body['data'], performancedata); 
 				expect(isEqual).to.be.true;	
				done()
			});
		});
		
		it("check candidates",function(done){
			agent.get('api/req/pare-10051080/candidates')
			.end(function(err,res){
				cleaned_candidates = { status: 'success', data: [] };
				var isEqual = _.isEqual(res.body, cleaned_candidates);
				expect(isEqual).to.be.true;
				done()
			});
		});

		it("check reqs",function(done){
			agent.get('api/reqs')
			.end(function(err,res){
				var req_n = { REQ_NUM: 'pare-10049918',
						    DATE_OPEN: '2016-02-10',
						    DATE_ASSIGNED_RPO: '2016-04-01',
						    LATEST_FILLED_DATE: '1970-01-01',
						    REQ_STATUS: 'Open' }
				expect(res.body['data']).to.contain(req_n);
				done()
			});
		});

		it("check workload_count",function(done){
			agent.get('api/reqs/workload/count')
			.end(function(err,res){
				expect(res.body['data'][0]['styles']).to.equal('blue')
				expect(res.body['data'][0]['data'].length).to.equal(8)
				done()
			});
		});

		it("check workload_age",function(done){
			agent.get('api/reqs/workload/age')
			.end(function(err,res){
				expect(res.body['data'][0]['styles']).to.equal('blue')
				expect(res.body['data'][0]['data'].length).to.equal(8)
				done()
			});
		});

		it("check reps_open",function(done){
			agent.get('api/reqs/open')
			.end(function(err,res){
				var reps_open =  { REQ_NUM: 'pare-10050808',
								   NUM_OPENINGS: 1,
								   REQ_STATUS: 'Open',
								   JOB_TITLE: 'Product Analyst',
								   JOB_FUNCTION: 'Software Development, Programming & Validation',
								   BUSINESS_UNIT: 'PII',
								   RECRUITER_NAME: 'Brenda May',
								   DATE_ASSIGNED_RPO: '2016-04-13',
								   DATE_OPEN: '2016-04-13',
								   FIRST_QUALIFIED_DATE: '2016-06-06',
								   FIRST_HIRE_DATE: '1970-01-01',
								   LATEST_FILLED_DATE: '1970-01-01',
								   NUM_APPLIED: 12,
								   NUM_SUBMIT: 3,
								   NUM_QUALIFIED: 3,
								   NUM_HIRED: 0,
								   LOCATION: 'USA - Pennsylvania - Horsham'}
				expect(res.body['data']).to.contain(reps_open);
				done()
			});
		});

		it("check open_score",function(done){
			agent.get('api/reqs/open/scores')
			.end(function(err,res){
				console.log(res.body);
				//expect(res.body['data'].length).to.equal(361);
				done();
			});
		});

		it("check open_count",function(done){
			agent.get('api/reqs/open/count')
			.end(function(err,res){
				var reqs_open_count = { status: 'success', data: 27.76923076923077 };
				var isEqual = _.isEqual(res.body ,reqs_open_count);
				expect(isEqual).to.be.true;
				done();
			});
		});

		it("check open_age",function(done){
			agent.get('api/reqs/open/age')
			.end(function(err,res){
				var reqs_open_count = { status: 'success', data: 86.38461538461539};
				var isEqual = _.isEqual(res.body ,reqs_open_count);
				expect(isEqual).to.be.true;
				done();
			});
		});

		it("check countby region",function(done){
			agent.get('api/reqs/open/countby/region')
			.end(function(err,res){
			expect(res.body['data'].length).to.equal(51);
				done();
			});
		});

		it("check recruiters",function(done){
			agent.get('api/recruiters')
			.end(function(err,res){
				var recruiters = { status: 'success',
  									data:
									   [ { RECRUITER_NAME: 'Agnieszka Tyrpa' },
									     { RECRUITER_NAME: 'Arletta Magiera' },
									     { RECRUITER_NAME: 'Boubacar Cisse' },
									     { RECRUITER_NAME: 'Brenda May' },
									     { RECRUITER_NAME: 'Brent Woodruff' },
									     { RECRUITER_NAME: 'Ewa Ostrowska-Juncho' },
									     { RECRUITER_NAME: 'Fernanda Rojas' },
									     { RECRUITER_NAME: 'Jill Zajac' },
									     { RECRUITER_NAME: 'Klara Feltl' },
									     { RECRUITER_NAME: 'Leandro Arias' },
									     { RECRUITER_NAME: 'Meredith Nath' },
									     { RECRUITER_NAME: 'Monika Borowska' },
									     { RECRUITER_NAME: 'Samantha Ramsdell' } ] }
				var isEqual = _.isEqual(res.body ,recruiters);
				expect(isEqual).to.be.true;
				done();
			});
		});

		it("check reviews_score",function(done){
			agent.get('api/Parexel/reviews/scores')
			.end(function(err,res){
				expect(res.body['data'].length).to.equal(470);
				done();
			});
		});

		it("check reviews_content",function(done){
			agent.get('api/Parexel/reviews/content')
			.end(function(err,res){
				expect(res.body['data'].length).to.equal(90);
				done();
			});
		});

		it("check reviewsID",function(done){
			agent.get('api/review/1017276768')
			.end(function(err,res){
				var isEqual = _.isEqual(res.body ,review_id);
				expect(isEqual).to.be.true;
				done();
			});
		});

		it("check twitterhandles",function(done){
			agent.get('api/twitterhandles')
			.end(function(err,res){
				var twitterhandles = { status: 'success',
										  data:
										   [ { CLEAN_NAME: 'Parexel', TWITTER_HANDLE: 'PAREXEL' },
										     { CLEAN_NAME: 'Quintiles', TWITTER_HANDLE: 'Quintiles' },
										     { CLEAN_NAME: 'Covance', TWITTER_HANDLE: 'Covance' },
										     { CLEAN_NAME: 'ICON', TWITTER_HANDLE: 'ICONplc' },
										     { CLEAN_NAME: 'PRA Health', TWITTER_HANDLE: 'PRAHSciences' },
										     { CLEAN_NAME: 'INC Research', TWITTER_HANDLE: 'INC_Research' },
										     { CLEAN_NAME: 'Pharmaceutical Product Development',
										       TWITTER_HANDLE: 'ppdcro' },
										     { CLEAN_NAME: 'inVentiv Health', TWITTER_HANDLE: 'inventivpr' },
										     { CLEAN_NAME: 'Thermo Fisher', TWITTER_HANDLE: 'thermofisher' },
										     { CLEAN_NAME: 'Acme', TWITTER_HANDLE: 'IBM' } ] }
				var isEqual = _.isEqual(res.body ,twitterhandles);
				expect(isEqual).to.be.true;
				done();
			});
		});

		it("check company_news",function(done){
			agent.get('api/Parexel/news')
			.end(function(err,res){
				expect(res.body['data'].length).to.equal(134);
				done();
			});
		});

		// it("check upload",function(done){
		// 	agent.post('api/upload')
		// 	.end(function(err,res){
		// 		var upload = [ { file: 'Nathan trial 2.pdf', status: 'Success' } ];
		// 		var isEqual = _.isEqual(res.body ,upload);
		// 		expect(isEqual).to.be.true;
		// 		done();
		// 	});
		// });


		// it("check feedback",function(done){
		// 	agent.post('api/feedback')
		// 	.send({'type' : 'Bug', 'page' : 'All Pages', 'text' : "test1", 'date' : '1463050334878', 'username' : 'DB2INST1'})
		// 	.end(function(err,res){
		// 		console.log(res.body);
		// 		done();
		// 	});
		// });

		it("check get users",function(done){
			agent.get('api/users')
			.end(function(err,res){
				//console.log(res.body['data'])
				var isEqual = _.isEqual(res.body ,get_users);
				expect(isEqual).to.be.true;
				done();
			});
		});

		it("check roles",function(done){
			agent.get('api/roles')
			.end(function(err,res){
				var roles = { status: 'success',
							  data:
							   [ { ROLEID: 1, ROLENAME: 'user' },
							     { ROLEID: 2, ROLENAME: 'admin' },
							     { ROLEID: 3, ROLENAME: 'superadmin' } ] }
				var isEqual = _.isEqual(res.body ,roles);
				expect(isEqual).to.be.true;
				done();
			});
		});

		it("check post users",function(done){
			agent.post('api/users')
			.send({'USERNAME' : 'wwww', 'FIRSTNAME' : 'ww', 'LASTNAME' : 'llll', 'STATUS' : 'ACTIVE','PASSWORD' : '1234', 'ROLEID' : '1', 'COMPANYID' : [1]})
			.end(function(err,res){
				//console.log(res.body);
				var post_user = { status: 'success', data: null };
				var isEqual = _.isEqual(res.body ,post_user);
				expect(isEqual).to.be.true;
				done();
			});
		});	

		 it("check put users(update the user information)",function(done){
		 	agent.put('api/users')
			.send({'USERNAME' : 'wwww', 'FIRSTNAME' : 'ww', 'LASTNAME' : 'llll', 'STATUS' : 'ACTIVE','PASSWORD' : '1234', 'ROLEID' : '2', 'COMPANYID' : [1]})
			.end(function(err,res){
				var post_user = { status: 'success', data: null };
				var isEqual = _.isEqual(res.body ,post_user);
				expect(isEqual).to.be.true;
				//console.log(res.body);
				done();
			});
		});		


		it("check delete users",function(done){
			agent.delete('api/users/wwww')
			.end(function(err,res){
				var delete_user = { status: 'success', data: null };
				var isEqual = _.isEqual(res.body ,delete_user);
				expect(isEqual).to.be.true;
				//console.log(res.body);
				done();
			});
		});

		it("check override",function(done){
			agent.post('api/override')
			.send({'req_num' : 'pare-10051080 ', 'username' : 'test1@cn.ibm.com ', 'name' : 'test1', 'priority' : ' 99', 'justification' : 'test1'})
			.end(function(err,res){
				var override_res = { status: 'success', data: [] };
				var isEqual = _.isEqual(res.body, override_res);
				expect(isEqual).to.be.true;				
				//console.log(res.body);
				done();
			});
		});		

		it("check override delete reqnum",function(done){
			agent.get('api/override/delete/pare-10051080')
			.end(function(err,res){
				var override_delete = { status: 'success', data: [] };
				var isEqual = _.isEqual(res.body, override_delete);
				expect(isEqual).to.be.true;
				//console.log(res.body);
				done();
			});
		});		


	});
});

var comp1 = ['Quintiles',
 			 'Covance',
 			 'ICON',
 			 'PRA Health',
			 'INC Research',
			 'Pharmaceutical Product Development',
			 'inVentiv Health'];



var expdata = [{REQ_NUM: 'pare-10051080',
    			NUM_OPENINGS: 1,
    			REQ_STATUS: 'Open',
    			JOB_TITLE: 'Principal Statistical Programmer',
    			JOB_FUNCTION: 'Biostatistics & Clinical Programming',
    			BUSINESS_UNIT: 'CRS',
    			RECRUITER_NAME: 'Agnieszka Tyrpa',
    			DATE_ASSIGNED_RPO: '2016-05-09',
    			DATE_OPEN: '2016-03-30',
    			FIRST_QUALIFIED_DATE: '1970-01-01',
    			FIRST_HIRE_DATE: '1970-01-01',
    			LATEST_FILLED_DATE: '1970-01-01',
    			NUM_APPLIED: 4,
    			NUM_SUBMIT: 0,
    			NUM_QUALIFIED: 0,
    			NUM_HIRED: 0,
    			LOCATION: 'Germany - Berlin - Berlin',
    			JOB_DESC: 'The Principal Statistical Programmer will be recognized as a subject matter expert, providing technical support and expert advice to internal and external sponsors. In addition, the Principal Statistical Programmer can fill the Statistical Programming Coordinator role on projects, liaise with sponsors, Data Operations Leads, and other functional areas as required. Further, the Principal Statistical Programmer will monitor quality, timelines, resource allocation, and productivity in relation to budgets. General areas of responsibility also includes: import/export programming specification development, test data creation and test data entry, import/export programming functional testing, as well as mapping specifications to support relevant data standards.' } ]

var scoredata = [ { name: 'Role Seniority', value: 3.3063380281690145 },
				  { name: 'Functional Area', value: 4.959507042253522 },
				  { name: 'Region', value: 1.6531690140845072 },
				  { name: 'Predicted Age', value: 10 },
				  { name: 'Predicted Submit %', value: -1.566196311921911e-15 } ]

var performancedata = [ { REQ_NUM: 'pare-10051080',
					    VOLUME_MEAN: 10,
					    VOLUME_FG: 3,
					    PERCENT: 0,
					    AGE: 0,
					    VOL: 0 },
					  { REQ_NUM: 'pare-10051080',
					    VOLUME_MEAN: 10,
					    VOLUME_FG: 3,
					    PERCENT: 10,
					    AGE: 12,
					    VOL: 0 },
					  { REQ_NUM: 'pare-10051080',
					    VOLUME_MEAN: 10,
					    VOLUME_FG: 3,
					    PERCENT: 100,
					    AGE: 127,
					    VOL: 1 },
					  { REQ_NUM: 'pare-10051080',
					    VOLUME_MEAN: 10,
					    VOLUME_FG: 3,
					    PERCENT: 20,
					    AGE: 25,
					    VOL: 0 },
					  { REQ_NUM: 'pare-10051080',
					    VOLUME_MEAN: 10,
					    VOLUME_FG: 3,
					    PERCENT: 30,
					    AGE: 38,
					    VOL: 1 },
					  { REQ_NUM: 'pare-10051080',
					    VOLUME_MEAN: 10,
					    VOLUME_FG: 3,
					    PERCENT: 40,
					    AGE: 50,
					    VOL: 1 },
					  { REQ_NUM: 'pare-10051080',
					    VOLUME_MEAN: 10,
					    VOLUME_FG: 3,
					    PERCENT: 50,
					    AGE: 63,
					    VOL: 1 },
					  { REQ_NUM: 'pare-10051080',
					    VOLUME_MEAN: 10,
					    VOLUME_FG: 3,
					    PERCENT: 60,
					    AGE: 76,
					    VOL: 1 },
					  { REQ_NUM: 'pare-10051080',
					    VOLUME_MEAN: 10,
					    VOLUME_FG: 3,
					    PERCENT: 70,
					    AGE: 88,
					    VOL: 1 },
					  { REQ_NUM: 'pare-10051080',
					    VOLUME_MEAN: 10,
					    VOLUME_FG: 3,
					    PERCENT: 80,
					    AGE: 101,
					    VOL: 1 },
					  { REQ_NUM: 'pare-10051080',
					    VOLUME_MEAN: 10,
					    VOLUME_FG: 3,
					    PERCENT: 90,
					    AGE: 114,
					    VOL: 1 } ]
var candidatesdata = [{CDS_REF_NUM: 2453621,
				    REQ_NUM: 'pare-10051080',
				    REQ_STATUS: 'Open',
				    CAND_NAME_FIRST: 'Prasenjit',
				    CAND_NAME_LAST: 'Ghosh',
				    APPLIED_DATE: '2016-04-13',
				    SUBMIT_DATE: '1970-01-01',
				    QUALIFIED_DATE: '1970-01-01',
				    HIRED_DATE: '1970-01-01',
				    SOURCE: 'N/A',
				    INACTIVE_DATE: '2016-04-18',
				    EMAIL: 'test@email.com',
				    PHONE: '123-456-7890' },
				  { CDS_REF_NUM: 4609913,
				    REQ_NUM: 'pare-10051080',
				    REQ_STATUS: 'Open',
				    CAND_NAME_FIRST: 'Kathrin',
				    CAND_NAME_LAST: 'Tronick',
				    APPLIED_DATE: '2016-03-31',
				    SUBMIT_DATE: '1970-01-01',
				    QUALIFIED_DATE: '1970-01-01',
				    HIRED_DATE: '1970-01-01',
				    SOURCE: 'N/A',
				    INACTIVE_DATE: '2016-05-10',
				    EMAIL: 'test@email.com',
				    PHONE: '123-456-7890' },
				  { CDS_REF_NUM: 4700134,
				    REQ_NUM: 'pare-10051080',
				    REQ_STATUS: 'Open',
				    CAND_NAME_FIRST: 'Velaga',
				    CAND_NAME_LAST: 'Kavitha',
				    APPLIED_DATE: '2016-04-04',
				    SUBMIT_DATE: '1970-01-01',
				    QUALIFIED_DATE: '1970-01-01',
				    HIRED_DATE: '1970-01-01',
				    SOURCE: 'N/A',
				    INACTIVE_DATE: '2016-06-02',
				    EMAIL: 'test@email.com',
				    PHONE: '123-456-7890' },
				  { CDS_REF_NUM: 5095459,
				    REQ_NUM: 'pare-10051080',
				    REQ_STATUS: 'Open',
				    CAND_NAME_FIRST: 'Arun',
				    CAND_NAME_LAST: 'G Mani',
				    APPLIED_DATE: '2016-06-08',
				    SUBMIT_DATE: '1970-01-01',
				    QUALIFIED_DATE: '1970-01-01',
				    HIRED_DATE: '1970-01-01',
				    SOURCE: 'N/A',
				    INACTIVE_DATE: '1970-01-01',
				    EMAIL: 'test@email.com',
				    PHONE: '123-456-7890' },
				  { CDS_REF_NUM: 5101822,
				    REQ_NUM: 'pare-10051080',
				    REQ_STATUS: 'Open',
				    CAND_NAME_FIRST: 'N/A',
				    CAND_NAME_LAST: 'N/A',
				    APPLIED_DATE: '1970-01-01',
				    SUBMIT_DATE: '1970-01-01',
				    QUALIFIED_DATE: '1970-01-01',
				    HIRED_DATE: '1970-01-01',
				    SOURCE: 'N/A',
				    INACTIVE_DATE: '1970-01-01',
				    EMAIL: 'test@email.com',
				    PHONE: '123-456-7890' } ] 

var review_id = { status: 'success',
				  data:
				   [ { COMPANY: 'Quintiles',
				       PUBLISHED_DATE: '2016-06-09 08:59:00.000000',
				       PUBLISHED_YR: 2016,
				       TITLE: 'Freelance Snr CRA',
				       TEXT_PROS: 'Working with on one Sponsor',
				       TEXT_CONS: 'Line management sometimes were not very forth coming',
				       OVERALL_RATING: 80,
				       RATING_CAREER_OPP: 60,
				       RATING_COMP_BENEFIT: 80,
				       RATING_CULTURE_VALS: 80,
				       RATING_SR_MGMT: 80,
				       RATING_WORK_LIFE: 80,
				       RECOMMEND: 'N/A',
				       STATUS: 'I worked at Quintiles (More than a year)',
				       OUTLOOK: 'N/A',
				       CEO_APPROVAL: 'N/A',
				       ADVICE_TO_MGMT: 'N/A',
				       LANGUAGE: 'English',
				       CRAWLED_DATE: '2016-06-10 19:51:14.000000',
				       INSERTED_DATE: '2016-06-10 20:12:41.000000',
				       BOARDREADER_ID: 1017276768,
				       URL: 'http://www.glassdoor.com/Reviews/Employee-Review-Quintiles-RVW10868457.htm' } ] }

var get_users = { status: 'success',
				data:
			{ 'huyannb@cn.ibm.com':
			   { USERNAME: 'huyannb@cn.ibm.com',
			     FIRSTNAME: 'Yan',
			     LASTNAME: 'Hu',
			     STATUS: 'ACTIVE',
			     ROLEID: 3,
			     COMPANYID: [ 1, 2 ] },
			  'chenjhui@cn.ibm.com':
			   { USERNAME: 'chenjhui@cn.ibm.com',
			     FIRSTNAME: 'Jianhui',
			     LASTNAME: 'Chen',
			     STATUS: 'ACTIVE',
			     ROLEID: 3,
			     COMPANYID: [ 1, 2 ] },
			  'test3@cn.ibm.com':
			   { USERNAME: 'test3@cn.ibm.com',
			     FIRSTNAME: 'test3',
			     LASTNAME: 'test3',
			     STATUS: 'ACTIVE',
			     ROLEID: 1,
			     COMPANYID: [ 1 ] },
			  'test1@cn.ibm.com':
			   { USERNAME: 'test1@cn.ibm.com',
			     FIRSTNAME: 'test1',
			     LASTNAME: 'test1',
			     STATUS: 'ACTIVE',
			     ROLEID: 1,
			     COMPANYID: [ 1, 2 ] },
			  'qawangnb@cn.ibm.com':
			   { USERNAME: 'qawangnb@cn.ibm.com',
			     FIRSTNAME: 'qingan',
			     LASTNAME: 'wang',
			     STATUS: 'ACTIVE',
			     ROLEID: 3,
			     COMPANYID: [ 1, 2 ] } } }
