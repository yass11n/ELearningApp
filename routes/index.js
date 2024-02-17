const { Router } = require("express");

const routes = Router();

routes.use("/api/v1/users", require("./user.route"));
routes.use("/api/v1/auth", require("./auth.route"));
routes.use("/api/v1/category", require("./category.route"));
routes.use("/api/v1/instructor", require("./instructor.route"))

module.exports = routes;
