const fs = require('fs');

const handleFileUpload = (file, path) => {
  const pathFile = `${path}/${Date.now()}-${file.hapi.filename}`;
  const data = file._data;

  return new Promise((resolve, reject) => {
    fs.writeFile(pathFile, data, err => {
      if(err) reject(err);
      resolve({ 
        success: true,
        data: { pathfile: pathFile.replace('public/', '') },
        message: 'Upload successfully',
      })
    })
  });
}

const removeFile = (path) => {
  path = path.replace('./', './public/');
  fs.unlink(path, () => {});
}

module.exports = {
  handleFileUpload,
  removeFile
};