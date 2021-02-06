import  Storage  from '@google-cloud/storage';
import axios from 'axios';

const storage = new Storage.Storage();

export default async function saveToGCP(path, filename) {
  const bucketName = "images90"

  let response = await storage.bucket(bucketName).upload(path);
  
  console.log(`${path} uploaded to ${bucketName}.`);
  return `https://storage.googleapis.com/${bucketName}/` + filename;
}