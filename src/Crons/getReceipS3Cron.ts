import fs from "fs";
import AWS from 'aws-sdk'
import consola from "consola";
import {getFileSize} from "../Utils/file";
import {redis} from "../redis";
import * as dotenv from "dotenv";
import os from "os"
import {influxdb} from "../Utils/metrics";
const computerName = os.hostname()

dotenv.config();
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});
const s3 = new AWS.S3();
const offerTempFileName = process.env.OFFERS_RECIPE_PATH || ''
const campaignTempFileName = process.env.CAMPAIGNS_RECIPE_PATH || ''
export const getOffersFileFromBucket = async () => {
  try {
    let s3Key = process.env.S3_OFFERS_RECIPE_PATH || ''
    let s3BucketName = process.env.S3_BUCKET_NAME || ''
    let params = {Bucket: s3BucketName, Key: s3Key}
    const s3Stream = s3.getObject(params!).createReadStream();
    s3Stream.on('error', (err) => {
      consola.error(err);
    });

    const tempFileDownload = fs.createWriteStream(offerTempFileName);

    s3Stream.pipe(tempFileDownload)
      .on('error', (err) => {
        consola.error('File Stream:', err);
      })
      .on('close', () => {
        // getFileSize(offerTempFileName).then(async size => {
        //   consola.success(`Offer computer name ${computerName}, file size ${offerTempFileName} is { ${size} }`);
        //   // await redis.set(`offersSize_`, size!)
        // })
        consola.success(`file from s3:${s3BucketName}/${s3Key}, to  ${offerTempFileName} was uploaded correctly.`);

      });

  } catch (error) {
    influxdb(500, `get_offers_file_from_s3_error`)
    console.error('offers s3 error:', error)
  } finally {

  }

}

export const getCampaignsFileFromBucket = async () => {
  try {
    let s3Key = process.env.S3_CAMPAIGNS_RECIPE_PATH || ''
    let s3BucketName = process.env.S3_BUCKET_NAME || ''
    let params = {Bucket: s3BucketName, Key: s3Key}
    const s3Stream = s3.getObject(params!).createReadStream();
    s3Stream.on('error', (err) => {
      consola.error(err);
    });

    const tempFileDownload = fs.createWriteStream(campaignTempFileName);

    s3Stream.pipe(tempFileDownload)
      .on('error', (err) => {
        consola.error('File Stream:', err);
      })
      .on('close', () => {
        // getFileSize(campaignTempFileName).then(async size => {
        //   consola.success(`Campaign computer name ${computerName} file size ${campaignTempFileName} is { ${size} }`);
        //   await redis.set(`campaignsSize_`, size!)
        // })
        consola.success(`file from s3:${s3BucketName}/${s3Key}, to  ${campaignTempFileName} was uploaded correctly.`);

      });

  } catch (error) {
    influxdb(500, `get_campaigns_file_from_s3_error`)
    console.error('campaigns s3 error:', error)
  } finally {

  }

}

