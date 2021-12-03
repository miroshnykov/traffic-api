import fs from "fs";
import AWS from 'aws-sdk'
import consola from "consola";
import * as dotenv from "dotenv";
import os from "os"
import {influxdb} from "../Utils/metrics";
import {IRecipeType} from "../Interfaces/recipeTypes";
import {setCampaignsToRedis, setOffersToRedis} from "./setRecipeToRedisCron";

const computerName = os.hostname()

dotenv.config();
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});
const s3 = new AWS.S3();

export const getFileFromBucket = async (type: IRecipeType): Promise<void> => {
  try {
    let tempFileName: string = ''
    let s3Key: string = ''
    let s3BucketName: string = ''
    let setRedisOffersOtCampaigns: any
    switch (type) {
      case 'offer':
        tempFileName = process.env.OFFERS_RECIPE_PATH || ''
        s3Key = process.env.S3_OFFERS_RECIPE_PATH || ''
        s3BucketName = process.env.S3_BUCKET_NAME || ''
        setRedisOffersOtCampaigns = setOffersToRedis
        break;
      case 'campaign':
        tempFileName = process.env.CAMPAIGNS_RECIPE_PATH || ''
        s3Key = process.env.S3_CAMPAIGNS_RECIPE_PATH || ''
        s3BucketName = process.env.S3_BUCKET_NAME || ''
        setRedisOffersOtCampaigns = setCampaignsToRedis
        break;
      default:
        throw Error(`${type} not define, not able to get file from s3 `)
    }

    const params = {Bucket: s3BucketName, Key: s3Key}
    const s3Stream = s3.getObject(params!).createReadStream();
    s3Stream.on('error', (err) => {
      consola.error(`getFileFromBucketError s3:${s3BucketName}/${s3Key}:`, err);
      influxdb(500, `get_${type}_file_from_s3_error`)
    });

    const tempFileDownload = fs.createWriteStream(tempFileName);

    s3Stream.pipe(tempFileDownload)
      .on('error', (err) => {
        consola.error(`File Stream error s3:${s3BucketName}/${s3Key}:`, err);
      })
      .on('close', () => {
        consola.success(`file from s3:${s3BucketName}/${s3Key}, to  ${tempFileName} was uploaded correctly.Computer name ${computerName}`);

        setTimeout(setRedisOffersOtCampaigns, 12000)
      });
  } catch (error) {
    influxdb(500, `get_${type}_file_from_s3_error`)
    console.error(` s3 get file error, by type:${type}, details:`, error)
  }
}
