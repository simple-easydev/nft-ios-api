
const { User, NotificationSetting } = require("models/users");
const { Admin } = require("models/admins");
const utils = require("middleware/utils");
const auth = require("middleware/auth");
const { generateUserToken } = require('helper');

const { matchedData } = require('express-validator');

const { Sequelize } = require('sequelize');
const { sendEmail } = require("helper/email");
const Vonage = require("helper/vonage");
const Verify = require("models/verify");
const Op = Sequelize.Op;

exports.signup = async (req, res) => {
    const { user_name, email, password, wallet_address, push_token, is_import } = matchedData(req);
    
    try {

        var user;

        if (!is_import) {
            user = await User.findOne({
                where: { user_name }
            });
            if (user) {
                res.status(422).json({error:"Username is already in use"})
                return;
            }
            user = await User.findOne({
                where: { email }
            }); 
            if (user) {
                res.status(422).json({error:"Email is already in use"})
                return;
            }
        }

        user = await User.findOne({
            where: { wallet_address }
        });

        const hashPassword = await auth.getHash(password);
        if(user){   // already signup and import case
            user.user_name = user_name;
            if (user.email != email) {
                user.email = email;
                user.email_verified = false;
                                
            }
            user.password = hashPassword;
            await user.save();

        }else{      // first signup
            
            user = await User.create({ user_name, email, wallet_address, password:hashPassword, email_verified: false });
            //assign channels
            await user.setChannels([1, 2, 3]);
            await user.generateNewToken();
            
        }

        if (!user.email_verified) {
            const verify = await Verify.findOne({
                where: { email }
            })
            const code = generateCode();
            if (verify) {
                verify.code = code;
                await verify.save();
            } else {
                await Verify.create({email: email, code: code});
            }
            sendVerifyEmail(user.user_name, email, code, "validation_code");
        }
        
        let pushSetting = await NotificationSetting.findOne({
            where: { user_id: user.id}
        })

        if (pushSetting) {
            pushSetting.push_token = push_token;
            await pushSetting.save()
        } else {
            await NotificationSetting.create({
                user_id: user.id,
                push_token: push_token,
                receive_message: 1,
                receive_like: 1,
                receive_follower: 1,
                receive_comment: 1,
                receive_chat: 1,
                receive_post: 1,
                recommend_people: 1,
            })
        }

        const data = user.get();
        delete data.password;
        res.status(200).json({ ...data });
    }catch(error){
        console.log(error);
        res.status(500).json({ error });
    }
}

exports.userByWallet = async (req, res) => {
    const { wallet_address } = matchedData(req);
    try {
        let user = await User.findOne({
            where: { wallet_address }
        });
        if(user){
            const data = user.get();
            delete data.password;
            res.status(200).json({ ...data });    
        } else {
            const data = {
                id: 0,
                user_name: "",
                email: ""
            }
            res.status(200).json({ data });  
        }

        
    }catch(error){
        console.log(error);
        res.status(500).json({ error });
    }
}

exports.emailVerify = async (req, res) => {
    const { email, code } = matchedData(req);
    try {
        let user = await User.findOne({
            where: { email }
        });
        let verify = await Verify.findOne({
            where: { email }
        })
        if(user){
            if (verify.code == code) {
                user.email_verified = true;
                await user.save();
                res.status(200).json({ result: "Success" });    
            } else {
                res.status(401).json({ error: "Code is not valid" });    
            }
        } else {
            res.status(422).json({ error: "Email does not exist" });  
        }
        
    }catch(error){
        console.log(error);
        res.status(500).json({ error });
    }
}

exports.registerPhoneNumber = async (req, res) => {
    const { phone_number, profile_name } = matchedData(req);
    const { id } = req.user;
    try {
        let user = await User.findOne({
            where: { phone_number }
        }); 
        // if (user) {
        //     res.status(422).json({error:"phone number is already in use"})
        //     return;
        // }

        user = await User.findByPk(id);
        user.phone_number = phone_number;
        user.profile_name = profile_name;

        await user.save();
        
        const requestId = await Vonage.sendVerificationCode(phone_number);
        res.status(200).json({ requestId });
    }catch(error){
        res.status(422).json({ error });
    }
}

exports.verifyPhoneNumber = async (req, res) => {
    const { code, request_id } = matchedData(req);
    const { id } = req.user;
    try {
        const user = await User.findByPk(id);
        const voResp = await Vonage.verifyCheck(request_id, code);
        if(voResp.status == 0){
            user.phone_number_verified = true;
            await user.save();
            res.status(200).json({message:"success"});
        }else{
            res.status(402).json({ error: voResp.error_text});
        }
    }catch(error){
        console.log(error);
        res.status(422).json({ error });
    }
}

exports.login = async (req, res) => {
    const { user_name, email, password, push_token } = matchedData(req);
    try {
        let user = await User.findOne({
            where: { 
                [Op.or]: [
                    { user_name },
                    { email }
                ]
            }
        });
        if(user){
            const isPasswordMatch = await user.checkPassword(password);
            if (!isPasswordMatch) {
                res.status(422).json({error:"Password is not match"});
                return;
            } else {
                if (push_token) {
                    let pushSetting = await NotificationSetting.findOne({
                        where: { user_id: user.id}
                    })
                    pushSetting.push_token = push_token;
                    await pushSetting.save();
                }
                
                // update user token
                await user.generateNewToken();

                const data = user.get();
                delete data.password;
                res.status(200).json({ ...data });
            }
        }else{
            res.status(422).json({error:"User name or Email does not exist"});
        }

    }catch(error){
        console.log(error);
        res.status(500).json({ error });
    }
}

exports.resendMail = async (req, res) => {
    
    const { to, type } = matchedData(req);

    var template = "";
    if (type == "signup") {
        template = "validation_code";
    } else if (type == "forgot_password") {
        template = "forgot_password";
    } 
    try {
        const code = generateCode();
        const user = await User.findOne({
            where: { email: to }
        });
        const verify = await Verify.findOne({
            where: {
                email: to
            }
        })

        if (verify) {
            verify.code = code;
            await verify.save();

            sendVerifyEmail(user.user_name, to, code, template);
            res.status(200).json({ result: "Success" });
        } else {
            res.status(401).json({ "error": "No such mail exist" });
        }

        
    } catch (err) {
        console.log(err);
        res.status(500).json({ error });
    }
}

exports.forgotPassword = async (req, res) => {
    
    const { email } = matchedData(req);
    
    try {
        const code = generateCode();
        const user = await User.findOne({
            where: { email }
        });
        const verify = await Verify.findOne({
            where: { email }
        })

        if (user) {
            if (verify) {
                verify.code = code;
                await verify.save();
            } else {
                await Verify.create({email: email, code: code});
            }
            sendVerifyEmail(user.user_name, email, code, "forgot_password");
            res.status(200).json({ result: "Success" });
        } else {
            res.status(401).json({ "error": "No such mail exist" });
        }

        
    } catch (err) {
        console.log(err);
        res.status(500).json({ error });
    }
}

exports.resetPassword = async (req, res) => {
    
    const { email, code, password } = matchedData(req);
    
    try {
        
        const user = await User.findOne({
            where: { email }
        });
        const verify = await Verify.findOne({
            where: { email }
        })

        if (user) {
            if (verify) {
                if (verify.code == code) {
                    
                    const hashPassword = await auth.getHash(password);
                    user.password = hashPassword;
                    await user.save()

                    res.status(200).json({ result: "Success" });

                } else {
                    res.status(401).json({ "error": "Invalid code" });        
                }
            } else {
                res.status(401).json({ "error": "Invalid code" });    
            }
            
        } else {
            res.status(401).json({ "error": "No such mail exist" });
        }

        
    } catch (err) {
        console.log(err);
        res.status(500).json({ error });
    }
}

sendVerifyEmail = (name, email, code, template) => {
    const data = {
        from: "support@rellanft.xyz",
        to: email,
        subject: "Mail Verification",
        template: template,
        variables: JSON.stringify({
            user_name: name,
            code: code,
            company: "Social Jool LLC"
        })
    }
    console.log("mail data", data);
    sendEmail(data)

}

generateCode = () => {
    const givenSet = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";

    let code = "";
    for(let i=0; i<6; i++) {
        let pos = Math.floor(Math.random()*givenSet.length);
        code += givenSet[pos];
    }
    return code;
}

exports.adminLogin = async (req, res) => {
    const { user_name, email, password } = matchedData(req);
    try {
        let user = await Admin.findOne({
            where: { 
                [Op.or]: [
                    { user_name },
                    { email }
                ]
            }
        });
        if(user){
            const isPasswordMatch = await user.checkPassword(password);
            if (!isPasswordMatch) {
                res.status(422).json({error:"Password is not match"});
                return;
            } else {
                // update user token
                await user.generateNewToken();
                const data = user.get();
                delete data.password;
                res.status(200).json({ ...data });
            }
        }else{
            res.status(422).json({error:"User name or Email does not exist"});
        }
    }catch(error){
        console.log(error);
        res.status(500).json({ error });
    }
}

exports.adminRegister = async (req, res) => {
    const { user_name, email, password, role } = matchedData(req);
    try {
        var user = await User.findOne({
            where: { email }
        }); 
        if (user) {
            res.status(422).json({error:"Email is already in use"})
            return;
        }
        const hashPassword = await auth.getHash(password);
        user = await Admin.create({ user_name, email, password:hashPassword, role });
        await user.generateNewToken();
        const data = user.get();
        delete data.password;
        res.status(200).json({ ...data });
    }catch(error){
        console.log(error);
        res.status(500).json({ error });
    }
}

exports.adminLoginByToken = async (req, res) => {
    const { id } = req.user;
    const user = await Admin.findByPk(id);
    const data = user.get();
    delete data.password;
    res.status(200).json({ ...data });
}