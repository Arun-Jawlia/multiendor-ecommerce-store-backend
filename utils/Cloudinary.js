require("dotenv").config({
    path: "./config/.env",
  });
const cloudinary = require("cloudinary");
const fs = require("fs");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  })
  
  
const uploadOnCloudinary = async(localFilePath, cloudinaryFolder) =>{
    console.log('uploading cloudinary', localFilePath, cloudinaryFolder)
    try {
        if (!localFilePath) return null
            //upload the file on cloudinary
            const response = await cloudinary.uploader.upload(localFilePath, {
                resource_type: "auto",
                folder: cloudinaryFolder
            })
            // file has been uploaded successfull
            //console.log("file is uploaded on cloudinary ", response.url);
            fs.unlinkSync(localFilePath)
            return response;

    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        return null;  
    }

}

module.exports = uploadOnCloudinary