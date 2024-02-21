const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const mime = require("mime-types");

const s3Client = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId: "AKIA6GBMHLZUQMWYHUOQ",
    secretAccessKey: "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",
  },
});

const PROJECT_ID = process.env.PROJECT_ID;

async function init() {
  console.log("executing script.js");

  const outDirPath = path.join(__dirname, "output");

  const p = exec(`cd ${outDirPath} && npm install && npm run build `);

  p.stdout.on("data", function (data) {
    console.log(data.toString());
  });

  p.stdout.on("error", function (data) {
    console.log("error", data.toString());
  });

  p.on("close", async function () {
    console.log("Build complete");
    const distFolderPath = path.join(__dirname, "output , dist");
    const distFolderContents = fs.readdirSync(distFolderPath, {
      recursive: true,
    });
    for (const file of distFolderContents) {
      const filePath = path.join(distFolderPath, file);
      if (fs.lstatSync(filePath).isDirectory()) continue;

      console.log("uploading", filePath);

      const putObjCommand = new PutObjectCommand({
        Bucket: "vercel-project-shrey",
        Key: `__output/${PROJECT_ID}/${file}`,
        Body: fs.createReadStream(filePath),
        ContentType: mime.lookup(filePath),
      });

      await s3Client.send(putObjCommand);
      console.log("uploaded", filePath);
    }
    console.log("done...");
  });
}

init();