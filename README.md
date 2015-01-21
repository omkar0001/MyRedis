# MyRedis
My custom redis server. This is just one of my stunts to write a in memory cache like redis, just to understand more about, how redis works. 
Also to understand, what will be challenges need to be faced when implementing some thing like REDIS.

How to run
==========

1. Install node.js
2. Clone the repo.
3. cd into the cloned folder.
4. execute the command ``` node ExoRedisServer.js rdb.txt ```
5. From client
    1. Type the command ``` telnet localhost 15000 ```
    2. Then play with the commands SET, GET, ZADD, ZCOUNT, ZRANGE, ZCARD.
    3. For example. Exceute it like this. Press enter after each command.
        1. ``` SET foo bad ```
        2. ``` GET foo ``` ( See the magic)
