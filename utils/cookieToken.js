
const cookieToken = async (user, res) => {
  try {
    const token = await user.getJwtToken();

      const options = {
        expires: new Date(
          Date.now() + 1 * 24 * 60 * 60 * 1000 // 1 day
        ),
        httpOnly: false, // change to true in production
      }
      
      user.password = undefined

      res.status(200).cookie('token', token, options).json({
        success: true,
        token,
        user
      })
  } catch (error) {
    console.log(error) 
  }
}

module.exports = cookieToken;