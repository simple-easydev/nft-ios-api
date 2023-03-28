
const fs = require("fs-extra");
const moment = require("moment");
const mime = require('mime');
const gm = require('gm');

const { UPLOAD_LINK, UPLOAD_PATH} = require("../config");

exports.moveTempFileToUpload = async (path) => {

    if(path){
        if(path.includes('/temp/')){
            const day = moment().date();
            const month  = moment().month() + 1;
            const year = moment().year();
            const fileName = path.split('/')[3];
            const desDir = `${UPLOAD_PATH}/${year}/${month}/${day}/`;
            const desPath = desDir + fileName;
            const sourcePath = `${UPLOAD_PATH}/temp/${fileName}`;
            try {
                await fs.ensureDir(desDir);
            } catch (err) {
                console.log(err);
                return null;
            }
            try{
                await fs.copy(sourcePath, desPath);
            }catch(err){
                console.log(err);
                return null;
            }
            try{
                // await fs.unlinkSync(sourcePath);
            }catch(err){
                console.log(err);
                return null;
            }
            const desLink = `${UPLOAD_LINK}/${year}/${month}/${day}/${fileName}`;
            return desLink;
        }
        return path;
    }

    return '';
};

exports.saveBase64Image = (data) => {
    // to declare some path to store your converted image
    try {
        const matches = data.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
        if (matches.length !== 3) {
            return new Error('Invalid input string');
        }
        const decodedImg = {
            type:matches[1],
            data:matches[2]
        };
        const imageBuffer = decodedImg.data;
        const type = decodedImg.type;
        const extension = mime.extension(type);
        const fileName = `image${Date.now()}.${extension}`;
        const filePath = `${UPLOAD_PATH}/temp/${fileName}`;
        fs.writeFileSync(filePath, imageBuffer, 'base64');
        return  `${UPLOAD_LINK}/temp/${fileName}`;
    } catch (err) {
        console.log(err);
        return data;
    }
}

