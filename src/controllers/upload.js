
const { UPLOAD_LINK, UPLOAD_PATH} = require("../config");
const { v4 }  = require('uuid');

exports.uploadFileBase64 =  async (req, res) => {
    // to declare some path to store your converted image
    // const matches:any = req.body.base64image.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    // const response:any = {};
    // try {
    //     if (matches.length !== 3) {
    //     return new Error('Invalid input string');
    //     }

    //     response.type = matches[1];
    //     response.data = Buffer.alloc(matches[2], 'base64');
    //     const decodedImg = response;
    //     const imageBuffer = decodedImg.data;
    //     const type = decodedImg.type;
    //     // const extension = mime.getExtension(type);
    //     const fileName = 'image.' + extension;

    //     fs.writeFileSync(`${UPLOAD_PATH}/temp/${fileName}`, imageBuffer, 'utf8');
    //     return res.send({'status':'success'});
    // } catch (err) {
    //     res.status(500).send(err);
    // }
};

exports.uploadFile = async (req, res) => {
    try {
        if(!req.files) {
            res.send({
                status: false,
                message: 'No file uploaded'
            });
        } else {
            const file = req.files.file;
            const filename = `${v4()}.${file.name}`;

            file.mv(`${UPLOAD_PATH}/temp/${filename}`);

            // send response
            res.send({
                status: true,
                message: 'File is uploaded',
                data: {
                    link:`${UPLOAD_LINK}/temp/${filename}`,
                    origin_name: file.name,
                    mimetype: file.mimetype,
                    size: file.size
                }
            });
        }
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }

};