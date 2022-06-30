const fs = require("fs");
const request = require("request");

const downloadFile = function (URL, id, callback) {
    request(URL)
        .pipe(fs.createWriteStream(`public/images/${id}.jpg`))
        .on("close", callback);
};

module.exports = downloadFile;
