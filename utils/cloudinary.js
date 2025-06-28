import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs/promises';
import dotenv from 'dotenv';
dotenv.config();

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Extract public ID from Cloudinary URL
const getPublicIdFromUrl = (url) => {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const lastSegment = pathname.substring(pathname.lastIndexOf("/") + 1);
    return lastSegment.split(".")[0]; // removes .jpg or .png
  } catch (err) {
    return null;
  }
};

// Upload to Cloudinary and remove local file
const uploadCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    await fs.unlink(localFilePath); // delete file after upload
    return response;
  } catch (error) {
    if (localFilePath) {
      try {
        await fs.unlink(localFilePath);
      } catch (unlinkErr) {
        console.warn("Failed to delete temp file:", unlinkErr.message);
      }
    }
    throw error;
  }
};

// // Delete asset from Cloudinary
// const deleteFromCloudinary = async (cloudinaryFilePath) => {
//   try {
//     if (!cloudinaryFilePath) {
//       throw new Error("Invalid Cloudinary URL");
//     }

//     const publicId = getPublicIdFromUrl(cloudinaryFilePath);
//     if (!publicId) {
//       throw new Error("Could not extract public ID from URL");
//     }

//     const response = await cloudinary.uploader.destroy(publicId);
//     return response;
//   } catch (error) {
//     throw new Error(error?.message || "Error occurred while destroying the asset");
//   }
// };

export {
  uploadCloudinary,
  
};
