var express = require('express');
var router = express.Router();
var _ = require('underscore');

var dal = require('../dataAccessLayer');
var priorityScoreCalculator = require('../calculators/priorityScoreCalculator');
var trendingWorkloadCalculator = require('../calculators/trendingWorkloadCalculator');
var authentication=require('../common/authentication');

require('../config');

// check if user is authenticated before proceeding with request
router.use(function(req, res, next) {
  if(!req.session.login) {
    res.status(401);
    res.json(buildErrorResponse('401 - Not Authorized'));
    return;
  }
  next();
});

// check if user has access to client theme before proceeding with request
router.use(function(req, res, next) {
  if(!req.session.currentClient) {
      res.status(403).json({'error' : 'Forbidden'});
      return;
  }
  next();
});

// Get config properties required by UI (do not remove)
router.get('/config', function(req, res, next) {
  var obj = { name: global_config.app.name, build: global_config.app.build };
  res.send(obj);
});

// Get client theme (do not remove)
router.get('/theme/:client', function(req, res, next) {
  var theme = require('../themes/' + req.params.client + '.json');
  res.send(theme);
});

// Get a req
router.get('/req/:reqNum', checkPermission([global_config.permission.ID_PAGE_REQUISITION]), function(req,res) {
    dal.getReq(req.params.reqNum,function(data){
        res.json(buildSuccessResponse(data));
    }, errorClbk(res), req.session.currentClient);
});

// Get a req with priority score
router.get('/req/:reqNum/scores', checkPermission([global_config.permission.ID_PAGE_REQUISITION]), function(req,res) {
  var stepThree = function(stepOneData, stepTwoData) {
    dal.getScoredReq(req.params.reqNum,function(data){
        data = priorityScoreCalculator.calcPriorityScores(data, stepOneData, stepTwoData);
        res.json(buildSuccessResponse(data));
    }, errorClbk(res), req.session.currentClient);
  };

  var stepTwo = function(stepOneData) {
    dal.getMaxSubmitRate(function(data){
        stepThree(stepOneData, data);
    }, errorClbk(res), req.session.currentClient);
  };

  var start = function() {
    dal.getMaxDaysPredOpen(function(data){
        stepTwo(data);
    }, errorClbk(res), req.session.currentClient);
  };

  start();
});

// Get a group with priority score
router.get('/group/:groupNum/scores', checkPermission([global_config.permission.ID_PAGE_REQUISITION]), function(req,res) {
  var stepThree = function(stepOneData, stepTwoData) {
    dal.getScoredReq(req.params.groupNum,function(data){
        data = priorityScoreCalculator.calcPriorityGroups(data, stepOneData, stepTwoData);
        res.json(buildSuccessResponse(data));
    }, errorClbk(res), req.session.currentClient);
  };

  var stepTwo = function(stepOneData) {
    dal.getMaxSubmitRate(function(data){
        stepThree(stepOneData, data);
    }, errorClbk(res), req.session.currentClient);
  };

  var start = function() {
    dal.getMaxDaysPredOpen(function(data){
        stepTwo(data);
    }, errorClbk(res), req.session.currentClient);
  };

  start();
});

// Get single req performance trend
router.get('/req/:reqNum/performance', checkPermission([global_config.permission.ID_PAGE_REQUISITION]), function(req,res){
    dal.getTrendingPerformance(req.params.reqNum,function(data){
        res.json(buildSuccessResponse(data));
    }, errorClbk(res), req.session.currentClient);
});

// Get req candidates
router.get('/req/:reqNum/candidates', checkPermission([global_config.permission.ID_PAGE_REQUISITION]), function(req,res){
    dal.getReqCandidates(req.params.reqNum, function(data){
        res.json(buildSuccessResponse(data));
    }, errorClbk(res), req.session.currentClient);
});

// Get network sourcing scores for a req
router.get('/req/:reqNum/sourcing/network', checkPermission([global_config.permission.ID_PAGE_REQUISITION]), function(req,res) {
    dal.getReqNetworkScores(req.params.reqNum,function(data){
        res.json(buildSuccessResponse(data));
    },function(error){
        res.status(500);
        res.json(buildErrorResponse(error));
    }, req.session.currentClient);
});

// Get resume sourcing scores for a req
router.get('/req/:reqNum/sourcing/resume', checkPermission([global_config.permission.ID_PAGE_REQUISITION]), function(req,res) {
    dal.getReqResumeScores(req.params.reqNum,function(data){
        res.json(buildSuccessResponse(data));
    },function(error){
        res.status(500);
        res.json(buildErrorResponse(error));
    }, req.session.currentClient);
});

// Get prospects for a req
router.get('/req/:reqNum/sourcing/prospects', checkPermission([global_config.permission.ID_PAGE_REQUISITION]), function(req,res) {
    dal.getProspects(req.params.reqNum,function(data){
        res.json(buildSuccessResponse(data));
    },function(error){
        res.status(500);
        res.json(buildErrorResponse(error));
    }, req.session.currentClient);
});

// Get resume education
router.get('/prospect/:candId/resume/education', checkPermission([global_config.permission.ID_PAGE_REQUISITION]), function(req,res){
    dal.getProspectResumeEducation(req.params.candId, function(data){
        res.json(buildSuccessResponse(data));
    }, errorClbk, req.session.currentClient);
});

// Get resume skills
router.get('/prospect/:candId/resume/skill', checkPermission([global_config.permission.ID_PAGE_REQUISITION]), function(req,res){
    dal.getProspectResumeSkill(req.params.candId, function(data){
        res.json(buildSuccessResponse(data));
    }, errorClbk, req.session.currentClient);
});

// Get prospect resume and handle error if it doesn't exist
router.get('/prospect/resume/:cvFilename', checkPermission([global_config.permission.ID_PAGE_REQUISITION, ]), function(req, res) {
  res.download('./resumes/' + req.params.cvFilename, function(err){
    if (err) {
      if (req.query.type == 'ats') {
        res.send("Please search for this candidate in your ATS to view resume");
      }
      res.send("No resume on file");
    }
  });
});

// Add a new prospect
router.post('/prospect/insert', checkPermission([global_config.permission.ID_PAGE_REQUISITION, ]), function(req, res) {
    dal.insertProspect(req.body, function(data){
        res.json(buildSuccessResponse(data));
    }, errorClbk(res), req.session.currentClient);
});

// Delete an existing prospect
router.post('/prospect/delete', checkPermission([global_config.permission.ID_PAGE_REQUISITION, ]), function(req, res) {
    dal.deleteProspect(req.body, function(data){
        res.json(buildSuccessResponse(data));
    }, errorClbk(res), req.session.currentClient);
});

// Add a new memo
router.post('/memo/insert', checkPermission([global_config.permission.ID_PAGE_REQUISITION, ]), function(req, res) {
    console.log("Started api")
    dal.insertMemo(req.body, function(data){
        console.log("Api success");
        res.json(buildSuccessResponse(data));
    }, errorClbk(res), req.session.currentClient);
});

// Get reqs
router.get('/reqs', checkPermission([global_config.permission.ID_PAGE_REQUISITION]), function(req,res){
    dal.getReqs(req.query, function(data){
        res.json(buildSuccessResponse(data));
    }, errorClbk(res), req.session.currentClient);
});

// Get trending workload, measured by open req count
router.get('/reqs/workload/count', checkPermission([global_config.permission.ID_PAGE_REQUISITION, global_config.permission.ID_PAGE_SUMMARY]), function(req,res){
    dal.getReqs(req.query, function(data){
        data = trendingWorkloadCalculator.calcTrendingWorkload(data, 'count');
        res.json(buildSuccessResponse(data));
    }, errorClbk(res), req.session.currentClient);
});

// Get trending workload, measured by avg req age
router.get('/reqs/workload/age', checkPermission([global_config.permission.ID_PAGE_SUMMARY]), function(req,res){
    dal.getReqs(req.query, function(data){
        data = trendingWorkloadCalculator.calcTrendingWorkload(data, 'age');
        res.json(buildSuccessResponse(data));
    }, errorClbk(res), req.session.currentClient);
});

// Get open reqs
router.get('/reqs/open', function(req,res){
    dal.getOpenReqs(req.query, function(data){
        res.json(buildSuccessResponse(data));
    }, errorClbk(res), req.session.currentClient);
});

// Get open reqs with priority scores
router.get('/reqs/open/scores', checkPermission([global_config.permission.ID_PAGE_REQUISITION, global_config.permission.ID_PAGE_SUMMARY]), function(req,res) {
  var stepThree = function(stepOneData, stepTwoData) {
    dal.getScoredReqs(req.query, function(data){
        var reqs = priorityScoreCalculator.calcPriorityScores(data, stepOneData, stepTwoData);
        var groups = priorityScoreCalculator.calcPriorityGroups(data, stepOneData, stepTwoData);
        console.log("Final calculated groups", groups);
        var obj = {
          reqs: reqs,
          groups: groups
        };
        res.json(buildSuccessResponse(obj));
    }, errorClbk, req.session.currentClient);
  };

  var stepTwo = function(stepOneData) {
    dal.getMaxSubmitRate(function(data){
        stepThree(stepOneData, data);
    }, errorClbk(res), req.session.currentClient);
  };

  var start = function() {
    dal.getMaxDaysPredOpen(function(data){
        stepTwo(data);
    },function(error){
        res.status(500);
        res.json(buildErrorResponse(error));
    }, req.session.currentClient);
  };

  start();
});

// Get average open reqs by recruiter
router.get('/reqs/open/count', checkPermission([global_config.permission.ID_PAGE_REQUISITION]), function(req,res){
    dal.getAvgOpenReqsByRecruiter(function(data){
        data = _.reduce(data, function(memo, num){ return memo + num['1']; }, 0) / data.length;
        res.json(buildSuccessResponse(data));
    }, errorClbk(res), req.session.currentClient);
});

// Get average days open by recruiter
router.get('/reqs/open/age', checkPermission([global_config.permission.ID_PAGE_REQUISITION, global_config.permission.ID_PAGE_SUMMARY]), function(req,res){
    dal.getAvgDaysOpenByRecruiter(function(data){
        data = _.reduce(data, function(memo, num){ return memo + num['1']; }, 0) / data.length;
        res.json(buildSuccessResponse(data));
    }, errorClbk(res), req.session.currentClient);
});

// Get open req count by data dimension
router.get('/reqs/open/countby/:countBy', checkPermission([global_config.permission.ID_PAGE_SUMMARY]), function(req,res){
    dal.getOpenReqsCount(req.params.countBy, req.query, function(data){
        res.json(buildSuccessResponse(data));
    }, errorClbk(res), req.session.currentClient);
});

// Get unique recruiters
router.get('/recruiters', checkPermission([global_config.permission.ID_PAGE_REQUISITION, global_config.permission.ID_PAGE_SUMMARY]), function(req,res){
    dal.getUniqueRecruiters(req.query, function(data){
        res.json(buildSuccessResponse(data));
    }, errorClbk(res), req.session.currentClient);
});

router.get('/:companyName/reviews/scores', checkPermission([global_config.permission.ID_PAGE_SOCIAL]), function(req,res){
    dal.getGlassdoorScores(req.params.companyName, function(data){
        res.json(buildSuccessResponse(data));
    },errorClbk(res));
});

router.get('/:companyName/reviews/content', checkPermission([global_config.permission.ID_PAGE_SOCIAL]), function(req,res){
    dal.getGlassdoorContent(req.params.companyName, function(data){
        res.json(buildSuccessResponse(data));
    },errorClbk(res));
});

router.get('/review/:reviewID', checkPermission([global_config.permission.ID_PAGE_SOCIAL]), function(req,res){
    dal.getReview(req.params.reviewID, function(data){
        res.json(buildSuccessResponse(data));
    }, errorClbk(res));
});

router.get('/twitterhandles', checkPermission([global_config.permission.ID_PAGE_SOCIAL]), function(req,res){
    dal.getTwitterHandles(function(data){
        res.json(buildSuccessResponse(data));
    }, errorClbk(res));
});

router.get('/:companyName/news', checkPermission([global_config.permission.ID_PAGE_SOCIAL]), function(req,res){
    dal.getNews(req.params.companyName, function(data){
        res.json(buildSuccessResponse(data));
    }, errorClbk(res));
});

// Post files and initiated python procedures in flask application
router.post('/upload/atsRefresh', dal.uploadToNode('uploads'), function(req, res) {
    console.log("File upload complete, now uploading to filestore");
    dal.uploadAllToFileStore("Parexel", "uploads/", function(clbkArr) {
      dal.initAtsRefresh('Parexel');
      dal.cleanUploadsFolder();
      res.send(clbkArr);
    }, errorClbk(res));
});

// Post feedback
router.post('/feedback', checkPermission([global_config.permission.ID_PAGE_FEEDBACK]), function(req, res) {
    dal.postFeedback(req.body, function(data){
        res.json(buildSuccessResponse(data));
    }, errorClbk(res));
});

//api for user management
router.get('/users', checkPermission(global_config.permission.ID_PAGE_ADMIN),function(req,res,next){
	dal.getUsers(function(data){ res.json(buildSuccessResponse(data));}, errorClbk(res));
});

router.get('/roles', checkPermission(global_config.permission.ID_PAGE_ADMIN),function(req,res,next){
	dal.getRoles(function(data){ res.json(buildSuccessResponse(data));}, errorClbk(res));
});

router.post('/users',checkPermission(global_config.permission.ID_PAGE_ADMIN),function(req,res,next){
	if(!req.body||!req.body.USERNAME){
		errorHandler("invalid input",res);
		return;
	}
	dal.getUserByName(req.body.USERNAME,function(data){
		if(data && data.length>0){
			errorHandler("user already exists",res);
			return;
		}
		//encrypt
		req.body.password=authentication.encrypt(req.body.password);
		dal.postUsers(req.body,function(data){
			 res.json(buildSuccessResponse(data));
		},errorClbk(res));

	},errorClbk(res));
});

router.put('/users',checkPermission(global_config.permission.ID_PAGE_ADMIN),function(req,res,next){
	if(!req.body||!req.body.USERNAME){
		errorHandler("invalid input",res);
		return;
	}
	if(req.body.PASSWORD){
		req.body.PASSWORD=authentication.encrypt(req.body.PASSWORD);
	}
	dal.updateUser(req.body,function(data){
		res.json(buildSuccessResponse(data));
	},errorClbk(res));
});

router.delete('/users/:userName',checkPermission(global_config.permission.ID_PAGE_ADMIN),function(req,res,next){
	if(!req.params.userName){
		errorHandler("invalid input",res);
		return;
	}
	dal.deleteUser(req.params.userName,function(data){
		res.json(buildSuccessResponse(data));
	},errorClbk(res));
});

var errorHandler=function(error,res){
	console.log("Error", error);
    res.status(500);
    res.json(buildErrorResponse(error));
};

// Post req override (manager only)
router.post('/override', checkPermission([global_config.permission.ID_RESOURCE_OVERRIDE]), function(req, res) {
    dal.postOverride(req.body, function(data){
        res.json(buildSuccessResponse(data));
    }, errorClbk(res), req.session.currentClient);
});

// Delete req override (manager only)
router.get('/override/delete/:reqNum', checkPermission([global_config.permission.ID_RESOURCE_OVERRIDE]), function(req, res) {
    dal.deleteOverride(req.params.reqNum, function(data){
        res.json(buildSuccessResponse(data));
    }, errorClbk(res), req.session.currentClient);
});

// Post new group
router.post('/group', checkPermission([global_config.permission.ID_RESOURCE_OVERRIDE]), function(req, res) {

    var reqData = req.body;

    console.log("reqData", reqData);

    var postToGroup = function(postData) {
      dal.postToGroup(postData, function(data){
          res.json(buildSuccessResponse(data));
      }, errorClbk, req.session.currentClient);
    };

    dal.deleteFromGroup(reqData.req_num, function(data){
        postToGroup(reqData);
    }, errorClbk, req.session.currentClient);

});

// Delete from group
router.get('/group/delete/:reqNum', checkPermission([global_config.permission.ID_RESOURCE_OVERRIDE]), function(req, res) {
    dal.deleteFromGroup(req.params.reqNum, function(data){
        res.json(buildSuccessResponse(data));
    }, errorClbk, req.session.currentClient);
});

// Delete entire group
router.get('/group/delete/all/:groupNum', checkPermission([global_config.permission.ID_RESOURCE_OVERRIDE]), function(req, res) {
    dal.deleteGroup(req.params.groupNum, function(data){
        res.json(buildSuccessResponse(data));
    }, errorClbk, req.session.currentClient);
});

// Get unique groups
router.get('/group/groups', checkPermission([global_config.permission.ID_RESOURCE_OVERRIDE]), function(req, res) {
    dal.getUniqueGroups(function(data){
        res.json(buildSuccessResponse(data));
    }, errorClbk, req.session.currentClient);
});

// standard 500 error callback
var errorClbk = function(res){
    function _realClbk(error){
        console.log("Error", error);
        res.status(500);
        res.json(buildErrorResponse(error));
    }
    return _realClbk;
};

// build error response callback
function buildErrorResponse(error){
    var result = {};
    result.status = "error";
    result.error = error;
    return result;
}

// build success response callback
function buildSuccessResponse(data){
    var result = {};
    result.status="success";
    var d = '';
    if (typeof data == "object"){
        d = data;
    }
    if (typeof data == "string" || typeof data == "number"){
        d = JSON.parse(data);
    }
    result.data = d;
    return result;
}

// check user permissions on request
function checkPermission(allowedResources){
    return function(req, res, next){
        var ownedResource = req.session.resource;
        if(!ownedResource){
            res.status(403).json({'error' : 'Forbidden'});
        }
        var isValid = false;
        for(var resourceId in ownedResource){
            if(-1 != allowedResources.indexOf(resourceId)){
                isValid = true;
                break;
            }
        }
        if(isValid){
            next();
        }
        else{
            res.status(403).json({'error' : 'Forbidden'});
        }
    };
}

module.exports = router;
