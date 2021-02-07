
const Storage = require("@google-cloud/storage");
const vision = require('@google-cloud/vision');

const storage = new Storage.Storage();


// Instantiates a client
const client = new vision.ImageAnnotatorClient();

async function saveToGCP(path, filename) {
  const bucketName = "images90";

  let response = await storage.bucket(bucketName).upload(path);

  console.log(`${path} uploaded to ${bucketName}.`);
  return `https://storage.googleapis.com/${bucketName}/` + filename;
}


async function annotateImage(filename) {
  const features = [{type: 'TEXT_DETECTION'}];
  const textURI = "gs://text90/"+filename;
  const imgURI = "gs://images90/"+filename;
  // Build the image request object for that one image. Note: for additional images you have to create
  // additional image request objects and store them in a list to be used below.
  const imageRequest = {
    image: {
      source: {
        imageUri: imgURI,
      },
    },
    features: features,
  };

  // Set where to store the results for the images that will be annotated.
  const outputConfig = {
    gcsDestination: {
      uri:textURI,
    },
    batchSize: 2, // The max number of responses to output in each JSON file
  };

  // Add each image request object to the batch request and add the output config.
  const request = {
    requests: [
      imageRequest, // add additional request objects here
    ],
    outputConfig,
  };

  const [operation] = await client.asyncBatchAnnotateImages(request);
  const [filesResponse] = await operation.promise()
  const destinationUri = filesResponse.outputConfig.gcsDestination.uri;
  storage
  console.log(`Output written to GCS with prefix: ${destinationUri}`);

  //save file to tmp
  let downloadOutput = await storage.bucket('text90').file(filename+"output-1-to-1.json").download()
  downloadOutput = downloadOutput.toString();
  let actualResult = JSON.parse(downloadOutput);
  return actualResult.responses[0].fullTextAnnotation.text;

}

module.exports = {saveToGCP, annotateImage}


