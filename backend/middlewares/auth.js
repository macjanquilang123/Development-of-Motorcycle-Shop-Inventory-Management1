const jwt = require("jsonwebtoken");
const secret = "secretKey";

module.exports = (req, res, next) => {
  const token = req.headers["x-auth-token"];
  if (!token) return res.status(403).send("Access Denied");

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).send("Invalid Token");
  }
};
