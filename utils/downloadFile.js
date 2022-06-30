const https = require("https"); // or 'https' for https:// URLs
const fs = require("fs");

const downloadFile = function (URL, id) {
    const file = fs.createWriteStream(`public/images/${id}.jpg`);
    const request = https.get(URL, function (response) {
        response.pipe(file);
        // after download completed close filestream
        file.on("finish", () => {
            file.close();
            console.log("Download Completed");
        });
    });
    return `http://localhost:5000/Images/${id}.jpg`;
};

module.exports = downloadFile;
