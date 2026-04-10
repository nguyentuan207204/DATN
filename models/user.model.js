const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const usersPath=path.join(__dirname,"../data/users.json");


exports.login=async(req,res)=>{
    const{cccd,password}=req.body;
    if (!cccd||!password){
        return res.status(400).json({message:"Thiếu CCCD hoặc mật khẩu"});
    }
    try{
        const users=JSON.parse(fs.readFileSync(usersPath,"utf-8"));
        const user=users.find(u=>u.cccd===cccd);
        if (!user){
            return res.status(404).json({message:"CCCD không tồn tại"});
        }
        const isMatch=await bcrypt.compare(password,user.password);
        if (!isMatch){
            return res.status(401).json({message:"Mật khẩu không đúng"});
        }
        const token=jwt.sign(
            {cccd:user.id,role:user.role},
            process.env.JWT_SECRET,
            {expiresIn:'1h'}
        );
        res.json({
            message:"Đăng nhập thành công",
            token,
            role:user.role
        });
    } catch(err){
        res.status(500).json({message:"Lỗi máy chủ"});
    }
}