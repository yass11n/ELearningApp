const { Router } = require("express");

const routes = Router();

routes.use("/api/v1/users", require("./user.route"));
routes.use("/api/v1/auth", require("./auth.route"));

module.exports = routes;
