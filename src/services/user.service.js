const { User } = require("../models");
const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const bcrypt = require("bcryptjs");

// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS - Implement getUserById(id)
/**
 * Get User by id
 * - Fetch user object from Mongo using the "_id" field and return user object
 * @param {String} id
 * @returns {Promise<User>}
 */
 const getUserById = async(id) => {
   return User.findOne({ _id: id});
}

//My approach create user
// const getUserById = async(id) => {
//    if( _id !== id){
      
//         throw new ApiError(httpStatus.BAD_REQUEST, "\"\"userId\"\" must be a valid mongo id")

//    }else {
//    return User.findOne({ _id: id});
// }
// }


// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS - Implement getUserByEmail(email)
/**
 * Get user by email
 * - Fetch user object from Mongo using the "email" field and return user object
 * @param {string} email
 * @returns {Promise<User>}
 */
 const getUserByEmail = async (email) => {
    return await User.findOne({email: email});
 }
// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS - Implement createUser(user)
/**
 * Create a user
 *  - check if the user with the email already exists using `User.isEmailTaken()` method
 *  - If so throw an error using the `ApiError` class. Pass two arguments to the constructor,
 *    1. “200 OK status code using `http-status` library
 *    2. An error message, “Email already taken”
 *  - Otherwise, create and return a new User object
 *    
 *   
 * @param {Object} userBody
 * @returns {Promise<User>}
 * @throws {ApiError}
 *
 * userBody example:
 * {
 *  "name": "crio-users",
 *  "email": "crio-user@gmail.com",
 *  "password": "usersPasswordHashed"
 * 
 * }
 *
 * 200 status code on duplicate email - https://stackoverflow.com/a/53144807
 */

//  createUser = async (userBody) => {
    
//     if(await User.isEmailTaken(userBody.email)) throw new ApiError(httpStatus.OK,"Email already taken");
     
//      userBody.password=await bcrypt.hash(userBody.password,10);

//      let user= await User.create(userBody)
     
      
//      return user; 
//   }

const createUser = async (userBody) => {
   if (await User.isEmailTaken(userBody.email)) {
      throw new ApiError(httpStatus.OK, "Email already taken");
    } else {
      const hashedPassword = await bcrypt.hash(userBody.password, 10);
      const newUser = await User.create({
        ...userBody,
        password: hashedPassword,
      });
    return newUser;
}
}
 

// TODO: CRIO_TASK_MODULE_CART - Implement getUserAddressById()
/**
 * Get subset of user's data by id
 * - Should fetch from Mongo only the email and address fields for the user apart from the id
 *
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
 const getUserAddressById = async (id) => {
  const data = await User.findOne({_id: id}, {email:1, address:1})
  console.log(data);
  return data;
};

/**
 * Set user's shipping address
 * @param {String} email
 * @returns {String}
 */
 const setAddress = async (user, newAddress) => {
  user.address = newAddress;
  await user.save();
  return user.address;
};

  module.exports ={
    getUserById,
    getUserByEmail,
    createUser,
    getUserAddressById,
    setAddress
  };
