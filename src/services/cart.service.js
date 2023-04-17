const httpStatus = require("http-status");
const { Cart, Product } = require("../models");
const ApiError = require("../utils/ApiError");
const config = require("../config/config");

// TODO: CRIO_TASK_MODULE_CART - Implement the Cart service methods

/**
 * Fetches cart for a user
 * - Fetch user's cart from Mongo
 * - If cart doesn't exist, throw ApiError
 * --- status code  - 404 NOT FOUND
 * --- message - "User does not have a cart"
 *
 * @param {User} user
 * @returns {Promise<Cart>}
 * @throws {ApiError}
 */
const getCartByUser = async (user) => {
  let cart = await Cart.findOne({email: user.email});
  if(cart == null){
    throw new ApiError(httpStatus.NOT_FOUND, "User does not have a cart")
  }
  return cart;
};

/**
 * Adds a new product to cart
 * - Get user's cart object using "Cart" model's findOne() method
 * --- If it doesn't exist, create one
 * --- If cart creation fails, throw ApiError with "500 Internal Server Error" status code
 *
 * - If product to add already in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product already in cart. Use the cart sidebar to update or remove product from cart"
 *
 * - If product to add not in "products" collection in MongoDB, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product doesn't exist in database"
 *
 * - Otherwise, add product to user's cart
 *
 *
 *
 * @param {User} user
 * @param {string} productId
 * @param {number} quantity
 * @returns {Promise<Cart>}
 * @throws {ApiError}
 */
const addProductToCart = async (user, productId, quantity) => {
  //Get user's cart object using "Cart" model's findOne() method
  let cart = await Cart.findOne({email: user.email});
 // If it doesn't exist, create one
  if(!cart){
    try{
        cart = await Cart.create({
          email: user.email,
          cartItems: [],
          paymentOption: config.default_payment_option,
        })
    }catch(error){
      //If cart creation fails, throw ApiError with "500 Internal Server Error" status code
       throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "User Cart Creation Failed because user already have cart");
    }
  }
  if(cart == null) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "User does not have a cart");
  }
  let productIndex = -1;
  for(let i = 0; i < cart.cartItems.length; i++){
    if(productId == cart.cartItems[i].product._id){
      productIndex = i;
    }
  }
  if(productIndex == -1) {
    let product = await Product.findOne({ _id: productId});
  
    if(product == null){
      //If product to add not in "products" collection in MongoDB, throw ApiError with
      throw new ApiError(httpStatus.BAD_REQUEST,"Product doesn't exist in database");
    }
    cart.cartItems.push({product: product, quantity: quantity})
  } else {
    //If product to add already in user's cart, throw ApiError with message - "Product already in cart. Use the cart sidebar to update or remove product from cart"
    throw new ApiError(httpStatus.BAD_REQUEST,"Product already in cart. Use the cart sidebar to update or remove product from cart");
  }
  //add product to user's cart
  await cart.save();
  return cart;
};


/**
 * Updates the quantity of an already existing product in cart
 * - Get user's cart object using "Cart" model's findOne() method
 * - If cart doesn't exist, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "User does not have a cart. Use POST to create cart and add a product"
 *
 * - If product to add not in "products" collection in MongoDB, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product doesn't exist in database"
 *
 * - If product to update not in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product not in cart"
 *
 * - Otherwise, update the product's quantity in user's cart to the new quantity provided and return the cart object
 *
 *
 * @param {User} user
 * @param {string} productId
 * @param {number} quantity
 * @returns {Promise<Cart>}
 * @throws {ApiError}
 */
const updateProductInCart = async (user, productId, quantity) => {
  //Get user's cart object using "Cart" model's findOne() method
  let cart = await Cart.findOne({email: user.email});
  //If cart doesn't exist, throw ApiError with
  if(cart == null){
    throw new ApiError(httpStatus.BAD_REQUEST, "User does not have a cart. Use POST to create cart and add a product")
  }
  
  //Get Product object using Product findOne() method
  let product = await Product.findOne({ _id: productId});
  //If product to add not in "products" collection in MongoDB, throw ApiError with
  if(product == null){
    throw new ApiError(httpStatus.BAD_REQUEST, "Product doesn't exist in database")
  }
  
  
  let productIndex = -1;
  //The loop iterates over each item in the cartItems array, and if a matching productId is found, 
  for(let i=0; i < cart.cartItems.length; i++){
    //compares the productId with the _id property of each item's product object. 
    if(productId == cart.cartItems[i].product._id){
      ////it updates the productIndex variable with the index of that item in the array.
      productIndex = i;
    }
  } 

  if(productIndex == -1){
    //If product to update not in user's cart, throw ApiError with
    throw new ApiError(httpStatus.BAD_REQUEST, "Product not in cart")
  }else {
    //update the product's quantity in user's cart to the new quantity provided and return the cart object
    cart.cartItems[productIndex].quantity = quantity;
  }
  //waits for an async save operation on cart object to complete before continuing
  await cart.save();
  
  return cart;
};

/**
 * Deletes an already existing product in cart
 * - If cart doesn't exist for user, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "User does not have a cart"
 *
 * - If product to update not in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product not in cart"
 *
 * Otherwise, remove the product from user's cart
 *
 *
 * @param {User} user
 * @param {string} productId
 * @throws {ApiError}
 */
const deleteProductFromCart = async (user, productId) => {
  let cart = await Cart.findOne({email: user.email});
  
  //If cart doesn't exist for user, throw ApiError with
  if(cart == null) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User does not have a cart");
  }

  let productIndex = -1;
  for(let i=0; i< cart.cartItems.length; i++){
    if(productId == cart.cartItems[i].product._id){
      productIndex = i;
    }
  }

  if(productIndex == -1){
    throw new ApiError(httpStatus.BAD_REQUEST,  "Product not in cart.")
  }else{
    cart.cartItems.splice(productIndex, 1);
  }

  await cart.save();
};


// TODO: CRIO_TASK_MODULE_TEST - Implement checkout function
/**
 * Checkout a users cart.
 * On success, users cart must have no products.
 *
 * @param {User} user
 * @returns {Promise}
 * @throws {ApiError} when cart is invalid
 */
 const checkout = async (user) => {
  // TODO - Test1
  let cart = await Cart.findOne({email: user.email});
  if (cart == null) {
    throw new ApiError(
      httpStatus.NOT_FOUND, 
      "User does not have a cart");
  }
  // TODO - Test2
  if (cart.cartItems.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Cart is empty");
  }
  // TODO - Test3
  let hasSetNonDefaultAddress = await user.hasSetNonDefaultAddress();
  if (!hasSetNonDefaultAddress) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Address not set");
  }
  // TODO - Test4
  let total = 0;
  for (let i = 0; i < cart.cartItems.length; i++) {
    total += cart.cartItems[i].product.cost * cart.cartItems[i].quantity;
  }

  if (total > user.walletMoney) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "User has insufficient money to process"
    );
  }
  // TODO - Test 5
  user.walletMoney -= total;
  await user.save();

  cart.cartItems = [];
  await cart.save();
  
};

module.exports = {
  getCartByUser,
  addProductToCart,
  updateProductInCart,
  deleteProductFromCart,
  checkout
};
