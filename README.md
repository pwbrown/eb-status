# eb-status
Very simple AWS ElasticBeanstalk environment health checker for node.js

##Installation
	npm install eb-status --save
	
	//Require package in your code
	var ebConfig = require('eb-status');

##Initialization
Create a new instance of the package and pass in the following configuration settings

###"environments"
* Simple list of ElasticBeanstalk environment names to use

```
environments: ["Env1", "Env2", "Env3"]
```

###"maxEvents"
* Defines maximum number of events to retrieve on a single "events" method call

```
maxCount: 10  (Defaults to 20)
```

###"ebConfig"
* Defines aws-sdk config settings to connect to elastic beanstalk (requires an IAM user with minimum access to elasticbeanstalk "read" permissions)
* Refer to aws-sdk documentation for full details on available config settings

```
//Simple example to get it working
ebConfig:{
	region: 'aws_region',
	accessKeyId: 'IAM_user_accessKeyId',
	secretAccessKey: 'IAM_user_secretAccessKey'
}
```

###Initialization Example

```Javascript
var status = new ebConfig({
	environments: [
		"Env1",
		"Env2",
		"Env3"
	],
	maxEvents: 10,
	ebConfig: {  //Holds AWS-SDK Config settings
		region: 'us-east-1',
		accessKeyId: 'access_key',
		secretAccessKey: 'access_secret'
	}
});
```

##Methods
####After Initializing the elasticbeanstalk sdk using the method above, you can simply call the following methods to retrieve status information

###***"enviornments"***

```Javascript
status.environments(function(err, data){
	//Data is an array of information on each enviornment that was provided during initialization
});
```

#####--Arguments:
* Callback function

#####--Data Returned:

```Javascript
data: [
	{
		envName:      "Environment Name",
		appName:      "Application Name",
		envId:        "Environment Id",
		created:      "Created Date - Date String",
		updated:      "Last Updated Date - Date String",
		envStatus:    "Status Of Environment Server",
		health:       "Health Of Environment - Represented by Color",
		healthStatus: "Health Status of Environment"  
	},
	.
	.
	.
]
```

###***"health"***

```Javascript
status.health("env_name", function(err, data){
	//Data is an object with environment data
})
```

#####--Arguments:
* environment name - String - Required
* Callback function

#####--Data Returned:

```Javacript
data: {
	envName: "Environment Name",
	envStatus: "Status of Environment Server",
	health: "Health of Environment - Represented by Color",
	healthStatus: "Health Status of Environment",
	causes: [],
	metrics: {
		Duration: Integer, //Last duration of seconds for metric reporting
		Latency:{
			P10: Float,  //Average latency for slowest 90% of requests
			P50: Float,  //Average latency for slowest 50%
			P75: Float,  //Average latency for slowest 25%
			P85: Float,  //Average latency for slowest 15%
			P90: Float,  //Average latency for slowest 10%
			P95: Float,  //Average latency for slowest 5%
			P99: Float,  //Average latency for slowest 1%
			P999: Float  //Average latency for slowest 0.1%
		},
		RequestCount: Integer,  //Number of requests in the last duration seconds
		StatusCodes: {
			Status2xx: Integer,
			Status3xx: Integer,
			Status4xx: Integer,
			Status5xx: Integer
		}
	},
	instances: {
		Degraded: Integer,
		Info: Integer,
		NoData: Integer,
		Ok: Integer,
		Pending: Integer,
		Severe: Integer,
		Unknown: Integer,
		Warning: Integer
	}
}
```


###***"events"***

```Javascript
status.events("environment_name", "paging_token", function(err, data){
	//Data contains "Events" array and a "pagingToken" if more events are available
})
```

#####--Arguments:
* environment name - String - Required
* paging token - Pass null if not applicable, use paging token retrieved by calling this method the first time
* Callback function

#####--Data Returned:

```Javascript
data:{
	events:[
		{
			envName:  "Environment Name",
			appName:  "Application Name",
			date:     "Date of message",
			message:  "Message Content",
			severity: "Message type"
		},
		.
		.
		.
	],
	pagingToken: "Used to get more events for the same instance"
}
```


##Possible Health Scenarios
| healthStatus | health | Indicates                                                                                                            |
|--------------|--------|----------------------------------------------------------------------------------------------------------------------|
| NoData       | Grey   | AWS Elastic Beanstalk and the health agent are reporting no data on an instance.                                     |
| Unknown      | Grey   | AWS Elastic Beanstalk and the health agent are reporting an insufficient amount of data on an instance.              |
| Pending      | Grey   | An operation is in progress on an instance within the command timeout.                                               |
| Ok           | Green  | An instance is passing health checks and the health agent is not reporting any problems.                             |
| Info         | Green  | An operation is in progress on an instance.                                                                          |
| Warning      | Yellow | The health agent is reporting a moderate number of request failures or other issues for an instance or environment.  |
| Degraded     | Red    | The health agent is reporting a high number of request failures or other issues for an instance or environment.      |
| Severe       | Red    | The health agent is reporting a very high number of request failures or other issues for an instance or environment. |