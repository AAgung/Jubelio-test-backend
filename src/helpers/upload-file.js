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
  if(path) {
    path = path.replace('./', './public/');
    fs.unlink(path, () => {});
  }
}

const getFile = (path) => {
  if(path) {
    if(path.includes('http://image.elevenia.co.id')) return path;
    return `${process.env.APP_URL}:${process.env.APP_PORT}/${path}`;
  }
  return path;
} 

module.exports = {
  handleFileUpload,
  removeFile,
  getFile
};