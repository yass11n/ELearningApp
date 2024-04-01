const Coupon = require("../models/coupon.model");
const {
  createOne,
  getOne,
  paginate,
  updateOne,
  deleteOne,
} = require("../services/factory-handler");

/**
 * @desc get coupons
 * @path GET /v1/coupon
 * @access private [Admin | Instructor]
 */
exports.getCoupons = paginate(Coupon, ["name", "code"]);

/**
 * @desc get coupon by id
 * @path GET /v1/coupon/:id
 * @access private [Admin | Instructor]
 */
exports.getCoupon = getOne(Coupon);

/**
 * @desc create new coupon
 * @path POST /v1/coupon
 * @access private [Admin | Instructor]
 */
exports.createCoupon = createOne(Coupon);

/**
 * @desc update coupon by id
 * @path PUT /v1/coupon/:id
 * @access private [Admin | Instructor]
 */
exports.updateCoupon = updateOne(Coupon);

/**
 * @desc delete coupon by id
 * @path DELETE /v1/coupon/:id
 * @access private [Admin | Instructor]
 */
exports.deleteCoupon = deleteOne(Coupon);