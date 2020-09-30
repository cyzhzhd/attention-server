## Team 183 Backend & DB

### Server URI
* __Primary(LB): backendLB-d5c9491c188b429e.elb.ap-northeast-2.amazonaws.com:3000__   
* Instance1: 3.35.25.72:3000   
* Instance2: 52.78.160.20:3000   

(TLS not enabled)

### MongoDB
* __Replicaset name__: rs0

__Instance 1__: 52.78.146.191  
__Instance 2__: 3.34.139.112  
__Instance 3__: 3.34.137.172  

(ACL connection only)

### Redis Cluster
* __Primary Host__:team183-redis.lbxaz4.ng.0001.apn2.cache.amazonaws.com:6379    

(VPC connection only)

### Specifications
* [RESTAPI - Swagger HUB](https://app.swaggerhub.com/apis/cyrojyro/swmteam-183/1.0.1#/)
* [Socket.io Specification](https://13.125.91.162/swmaestro/183-1/-/wikis/Socket.io-Specification)
* [API 요청하기](https://13.125.91.162/swmaestro/183-1/-/wikis/REST-API-%EC%9A%94%EC%B2%AD)

### Test Tools
* [Postman - RESTAPI test](https://www.postman.com/)
* [Socket.io Client Tool - Socket.io test](http://amritb.github.io/socketio-client-tool/)
* [MongoDB Compass - MongoDb test](https://www.mongodb.com/products/compass)
* [Redis Desktop Manager - Redis test](https://redisdesktop.com/)
