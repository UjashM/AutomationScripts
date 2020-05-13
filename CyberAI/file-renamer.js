const path = require('path');
const fs = require('fs');
//joining path of directory 
const directoryPath = 'C:\\Cyber-AI\\CyberAI\\assets\\images\\faculty\\';

fs.readdir(directoryPath, function (err, files) {
    //handling error
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    } 
    //listing all files using forEach
    files.forEach(function (file) {
        // Do whatever you want to do with the file
        let modifiedFileName = file.toLowerCase().trim().replace().replace(/ /g,'-');
        console.log(modifiedFileName);
        let modifiedFilePath = directoryPath + modifiedFileName;
        let filePath = directoryPath + file;
        fs.renameSync(filePath, modifiedFilePath);
    });
});