> traffic server

## Cluster

    A single instance of Node.js runs in a single thread. To take advantage of multi-core systems, the user will sometimes want to launch a cluster of Node.js processes to handle the load.
    https://nodejs.org/api/cluster.html#cluster_cluster

## Recipe

    recipe is getting from S3 bucket "recipe-api"
    checking fileSizeOffersCheck && fileSizeCampaignsCheck every 20 sec 
    to recipe-api project. 
    If size of recipe is different then download new files from s3 
    and reload the data to local redis for each instances

## Redis

    each instanse has local redis with offers && campaigns populated with cron campaignsToRedisCron & offersToRedisCron

## Sockets

    use for sync size of files with co-recipe

## Update particular record inside the recipe

    if the record offer or campaign was added | updated | deleted, project co-admin-back send sqs message with offerId or campaignId to co-recipe.
    recipe-api handle this record and send by socket to traffic-api with new data
    traffic-api get new record and update local redis 

## Docker setup

	docker build -t co-traffic .
   	docker run -it -p 5000:5000 --rm --name co-traffic-  co-traffic

## run

    create folder on local env /tmp/co-recipe-traffic
    download maxmind DB to folder /usr/share/GeoIP/GeoIP2-City.mmdb /usr/share/GeoIP/GeoIP2-ISP.mmdb
    npm run dev

## ex link

    http://localhost:5000/ad?offer=44669c38ea032aa63b94b904804131c8:2aad25bba4a84235956c7d8884fc53b85f9f5c3f3468544ae69880a225115c5dc9822ae051f70559d674a439ca272cac&debugging=debugging
    https://traffic.aezai.com/pl?o=b00a799d7cae9430b034fed4097080c3:c364290026fe9f5c6e7195d2b90dc7e12c778337aefbb0ba09b64172f21d875b1379754e52b9d5a8b1ad8452c4fe8a7e&debugging=debugging
    

## check recipe
    offer
        http://localhost:5000/getRecipeData?debugging=debugging&offerId=36349
        https://mghkpg.com/getRecipeData?debugging=debugging&offerId=35784
        https://traffic.aezai.com/getRecipeData?debugging=debugging&offerId=36520

    campaign
        http://localhost:5000/getRecipeData?debugging=debugging&campaignId=40
        https://traffic.aezai.com/getRecipeData?debugging=debugging&campaignId=40

## build

    npm run build

## env example

    HOST = localhost
    ENV = development
    PORT = 5000
    SOCKET_HOST=http://localhost:3001
    
    AWS_ACCESS_KEY_ID=
    AWS_SECRET_ACCESS_KEY=
    AWS_REGION=us-east-1
    AWS_DYNAMODB_REGION=us-west-2
    AWS_DYNAMODB_ENDPOINT=dynamodb.us-west-2.amazonaws.com
    AWS_DYNAMODB_TABLE_NAME=customOffers-production
   
    OFFERS_RECIPE_PATH=/tmp/co-recipe-traffic/offersRecipe.json.gz
    CAMPAIGNS_RECIPE_PATH=/tmp/co-recipe-traffic/campaignsRecipe.json.gz
    
    S3_OFFERS_RECIPE_PATH=offersRecipe.json.gz
    S3_CAMPAIGNS_RECIPE_PATH=campaignsRecipe.json.gz
    S3_BUCKET_NAME=co-recipe-staging
    
    MAXMIND_PATH=/usr/share/GeoIP/GeoIP2-City.mmdb
    MAXMIND_PATH_ISP=/usr/share/GeoIP/GeoIP2-ISP.mmdb

## docker build

	docker build -t traffic-api .
   	docker run -it -p 5000:5000 --rm --name traffic-api-  traffic-api

## autocannon
    set the load of 300 connections for 15 seconds
    autocannon -c 300 -d 15 http://localhost:5000/getRecipeData?debugging=debugging&offerId=36336
    autocannon -c 10 -d 15 http://localhost:5000/pl?o=881c7670e2d2228459a3e6ee1f1e181d:2a79b868d55c64bed2636f145e0c017109e3d851d67fdff2a202d2e9409e295258cb0f3cd06bc7c1a33d9f4045675371&debugging=debugging

# diagram

![](diagram-co-traffic.png)
 