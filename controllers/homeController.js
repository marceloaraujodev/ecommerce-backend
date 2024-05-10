

exports.home = (req, res) => {
  res.status(200).json({
    success: true,
    greeting: 'Hello from api'
  })
}
exports.dummy = (req, res) => {
  res.status(200).json({
    success: true,
    greeting: 'Dummy route'
  })
}