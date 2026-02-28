
exports.uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image uploaded",
      });
    }

    res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      fileName: req.file.filename,
      filePath: req.file.path,
    });

  } catch (error) {
    next(error);
  }
};

