### Traffic server

### Cluster

    A single instance of Node.js runs in a single thread. To take advantage of multi-core systems, the user will sometimes want to launch a cluster of Node.js processes to handle the load.
    https://nodejs.org/api/cluster.html#cluster_cluster

### Recipe

    recipe is getting from S3 bucket "recipe-api"
    checking fileSizeOffersCheck && fileSizeCampaignsCheck every 20 sec 
    to recipe-api project. 
    If size of recipe is different then download new files from s3 
    and reload the data to local redis for each instances

### Redis

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

### ex link

    http://localhost:5000/pl?o=ea2e2954ad2d4f56126c3932fd91e09e:8feb6e231a12fbff634b1ee92dedb972&debugging=debugging
    https://xuzeez.com/pl?o=17674b7cf3ff3d25164c2900a6d2e527:133342344f306140a37b2e1067daaccd&debugging=debugging
    

### check recipe
    offer
        http://localhost:5000/getRecipeData?debugging=debugging&offerId=36349
        https://mghkpg.com/getRecipeData?debugging=debugging&offerId=35784
        https://traffic.aezai.com/getRecipeData?debugging=debugging&offerId=36520

    campaign
        http://localhost:5000/getRecipeData?debugging=debugging&campaignId=40
        https://traffic.aezai.com/getRecipeData?debugging=debugging&campaignId=40

### gotzha stage url
    https://traffic.stage.kprnt.com/getRecipeData?debugging=debugging&offerId=38078

### ad-firm stage url
    https://traffic.stage.aezai.com/getRecipeData?debugging=debugging&offerId=36847
    https://traffic.stage.jatun.systems/getRecipeData?debugging=debugging&offerId=38078
    https://traffic.stage.jatun.systems/pl?o=a5d48fc5b257ef426dbfdfe2318f4b2f:806fcac95629f281bf44e65f9cb77f56&debugging=debugging
    https://traffic.stage.aezai.com/pl?o=56ba6cb4b6790bd640b4f84fdae92b4c:f021caef5e2c6d8d094763aa0f51829e&debugging=debugging
    https://traffic.stage.aezai.com/getRecipeData?debugging=debugging&campaignId=1000948

### resend lid just one time

    http://localhost:5000/getRecipeData?debugging=debugging&resendLid=***&lid=7e0a853e-595f-43b5-a42b-765cdc09cffa
    https://traffic.aezai.com/getRecipeData?debugging=debugging&resendLid=***&lid=c225991f-4a28-431c-a944-b26dc91484cb

### add record to redshift use lid example
#### example    
```shell script
const timestamp = Date.now();
const secret = '*****';
const hash = md5(`${timestamp}|${secret}`);

const params = {
  lid: '0139d2d0-e96b-4455-a0a0-d10077b275ec',
  hash,
  timestamp,
};
const { data } = await axios.post('https://traffic.aezai.com/lid', params);
```
#### response
```shell script
interface ILidResponse {
  success: boolean;
  lid: string;
  message?: string
  errors?: string
}

```

### build

    npm run build

### env example
```dotenv
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
GATEWAY_API_SECRET=***
```

### docker build

	docker build -t traffic-api .
   	docker run -it -p 5000:5000 --rm --name traffic-api-  traffic-api

### autocannon
    set the load of 300 connections for 15 seconds
    autocannon -c 300 -d 15 http://localhost:5000/getRecipeData?debugging=debugging&offerId=36336
    autocannon -c 10 -d 15 http://localhost:5000/pl?o=ea2e2954ad2d4f56126c3932fd91e09e:8feb6e231a12fbff634b1ee92dedb972&debugging=debugging

### nodeJs v16
#### New in Node.js: node: protocol imports

    import * as fs from 'node:fs';
    https://nodejs.org/api/esm.html#node-imports

# diagram

![](diagram-co-traffic.png)
 