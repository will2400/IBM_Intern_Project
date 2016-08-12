var express = require('express');
var router = express.Router();

router.get('/*', function(req, res, next){
	console.log('UserService Filter');
	if(!req.session.login)
	{
        res.status(401);
        res.json({'error' : '401 - Not Authorized'});
	}
	else
	{
		next();
	}
});

router.get('/clients', function(req, res, next){
	var value = req.session.company;
	res.send(value);
});

router.post('/switchClient', function(req, res, next){
	var clientId = req.body.clientId
	console.log('SwitchClient:', clientId, req.body);
	if(!req.session.company[clientId])
	{
		res.status(403).json({'error' : 'Forbidden'});
	}
	else
	{
		var clientName = req.session.company[clientId];
		req.session.currentClient = clientName;
		var retValue = require('../themes/' + clientName + '.json');
		retValue.clientId = clientId;
		res.send(retValue);
	}
});

router.get('/defaultClient', function(req, res, next){
	//TOOD:HARDCODE, RETURN FIRST CLENT FOR TEST
	var retValue = {};
	var companies = req.session.company;
	var clientId = Object.keys(companies)[0];
	console.log('defaultClient:', companies, clientId)
	if(clientId)
	{
		var clientName = req.session.company[clientId];
		var retValue = require('../themes/' + clientName + '.json');
		retValue.clientId = clientId;
	}
	res.send(retValue);
});

router.get('/currentClient', function(req, res, next){
	var clientName = req.session.currentClient;
	console.log("Client name", clientName);
	if(clientName){
		var retValue = require('../themes/' + clientName + '.json');
		for(var clientId in req.session.company){
			if(clientName == req.session.company[clientId]){
				 retValue.clientId = clientId;
				 break;
			}
		}
		res.send(retValue);
	}
	else{
		res.status(901).json({'message' : 'No Client Found'});
	}
});

router.get('/pages', function(req, res, next){
	var pageList = [];
	if(req.session.resource)
	{
		for(var key in req.session.resource)
		{
			pageList.push(req.session.resource[key]);
		}
	}
	res.send(pageList);
});

module.exports = router;
