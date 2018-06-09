var Tesseract = require('tesseract.js');
const myImage = 't1.jpg';
Tesseract.create({
    workerPath: './worker.js',
    langPath: './3.02/',
    corePath: './index.js', 
  })
  .recognize(myImage)
  .then(res => {
    console.log(res);
  });