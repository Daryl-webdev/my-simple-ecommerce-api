const jwt = require('jsonwebtoken')

exports.createAccessToken = authenticatedUser => {
	const data = {
		id: authenticatedUser._id,
		email: authenticatedUser.email,
		isAdmin: authenticatedUser.isAdmin,
		userName: authenticatedUser.userName,
		firstName: authenticatedUser.firstName,
		lastName: authenticatedUser.lastName
	}

	return jwt.sign(data, process.env.SECRET,{})
}

exports.newVerifyToken = (req, res, next)=>{
		let accessToken = req.headers.authorization
		if(typeof accessToken === "undefined"){
			req.accessToken = accessToken
			next()
		}else{
			accessToken = req.headers.authorization.slice(7)
			jwt.verify(accessToken,process.env.SECRET, (err, decodedToken)=>{
				if(err){
					res.send("Authentication Failed!") 
				}else{
					req.accessToken = accessToken
					req.decodedUser = decodedToken
					next()
				}	
			})	
		}
}

exports.verifyToken = (req, res, next)=>{
	let accessToken = req.headers.authorization
	if(typeof accessToken === "undefined"){
		res.send("Access Token is Required")
	}else{
		accessToken = req.headers.authorization.slice(7)
		jwt.verify(accessToken,process.env.SECRET, (err, decodedToken)=>{
			if(err){
				res.send("Authentication Failed!") 
			}else{
				req.decodedUser = decodedToken
				next()
			}	
		})	
	}
}

exports.verifyIsAdmin = (req, res, next)=>{(req.decodedUser.isAdmin) ? next() : res.send(`403 Forbidden Access: This Access is for Admin Only`)}

exports.verifyNonAdmin = (req, res, next)=>{(req.decodedUser.isAdmin) ? res.send(`403 Forbidden Access: This Access is for Non-admin Only`) : next()};