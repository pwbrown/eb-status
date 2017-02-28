var elasticbeanstalk = require('aws-sdk/clients/elasticbeanstalk');

var ebStatus = module.exports = function(config){
	if(typeof config.ebConfig == 'undefined'){
		console.error("***ERROR: Missing required amazon \"ebConfig\" credentials");
		return;
	}
	if(typeof config.environments == 'undefined' || typeof config.environments.length == 'undefined' || config.environments.length < 1){
		console.error("***ERROR: Missing required environments list");
	}
	this.eb = new elasticbeanstalk(config.ebConfig);
	this.maxEvents = config.maxEvents || 20;
	this.envs = config.environments;
	this.environments = function(cb){
		this.eb.describeEnvironments({EnvironmentNames: this.envs}, function(err, data){
			if(err){
				cb("Could not retrieve environment data. Please check your aws credentials, user permissions, and/or environment names.", null);
			}else{
				var returnData = [];
				for(var i = 0; i < data.Environments.length; i++){
					var _this = data.Environments[i];
					returnData.push({
						envName: _this.EnvironmentName || null,
						appName: _this.ApplicationName || null,
						envId: _this.EnvironmentId || null,
						created: _this.DateCreated || null,
						updated: _this.DateUpdated || null,
						envStatus: _this.Status || null,
						health: _this.Health || null,
						healthStatus: _this.HealthStatus || null
					})
				}
				if(returnData.length > 0)
					return cb(null, returnData);
				else
					return cb("Please pass valid environment names", null);
			}
		})
	}
	this.health = function(envName, cb){
		this.eb.describeEnvironmentHealth({AttributeNames:["All"], EnvironmentName: envName}, function(err, data){
			if(err){
				cb("Could not retrieve environment data. Please check your provided environment name and aws credentials.", null);
			}else{
				var returnData = {
					envName: data.EnvironmentName || null,
					healthStatus: data.HealthStatus || null,
					envStatus: data.Status || null,
					health: data.Color || null,
					causes: data.Causes || null,
					metrics: data.ApplicationMetrics || null,
					instances: data.InstancesHealth || null
				}
				return cb(null, returnData);
			}
		})
	}
	this.events = function(envName, pagingToken, cb){
		var eventConfig = {
			EnvironmentName: envName,
			MaxRecords: this.maxEvents
		}
		if(typeof pagingToken == 'string') eventConfig.NextToken = pagingToken;
		this.eb.describeEvents(eventConfig, function(err, data){
			if(err){
				cb("Could not retrieve environment data. Please check your provided environment name and aws credentials.", null);
			}else{
				var returnEvents = [];
				for(var i = 0; i < data.Events.length; i++){
					var _this = data.Events[i];
					returnEvents.push({
						date: _this.EventDate || null,
						message: _this.Message || null,
						appName: _this.ApplicationName || null,
						envName: _this.EnvironmentName || null,
						severity: _this.Severity || null
					})
				}
				return cb(null, {events: returnEvents, pagingToken: data.NextToken || null});
			}
		})
	}
}