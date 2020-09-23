# BE

## Express
express server port = aws port 3000

```
pm2 start file name
pm2 startup // 리부트시 자동 실행
pm2 log
pm2 monit
pm2 delete filenmae || all
pm2 start npm --name "desired name" -- start
```


#### Config key 암호화 
[Crypto js](https://cryptojs.gitbook.io/docs/)
Client에서 generate한 random string 16글자를 key로 씀.

#### Userlist 관리
##### 문제점
유저가 강제 종료 하거나, 올바르지 못한 방법으로 종료했을 때 접속 유저를 관리하기 어려움

##### 해결방안 
1. Client는 일정 시간 간격으로 서버로 signal을 보냄
2. 서버도 일정 시간 간격으로 유저 목록을 체크하며 signal을 안 보낸 유저를 접속해제 처리

1. webSocket을 이용하여 webSocket과 연결이 끊기면 disconnect 이벤트를 이용하여 접속해제 처리

+++
clustering을 pm2에 전담시키기 위해 Adapter로 firebase 사용



## DB

### firebase
write - [firebase-admin](https://firebase.google.com/docs/admin/setup#add-sdk)(server side)  
read - frebase config key(client side)  

#### Sign Up & Log In
Firebase에서 제공하는 Authentication(OAuth2.0 포함) 사용 

#### Realtime DB 설계  
Rooms = 룸 정보 + 등록 유저 정보  
MessageHub = 룸 정보 + 메시지    
Users = 유저 정보 + 등록 룸 정보  
OnlineUserlist = 접속중인 유저 목록

### MongoDB
* __Replicaset name__: rs0

__Instance 1__: 52.78.146.191  
__Instance 2__: 3.34.139.112  
__Instance 3__: 3.34.137.172  

### Redis Cluster
* __Primary Host__:redis-183.lbxaz4.ng.0001.apn2.cache.amazonaws.com
