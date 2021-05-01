const path = require("path")
const http = require("http") 
const express = require("express")
const socketio = require("socket.io")
const Filter = require("bad-words")
const {generateMessage, generateLocationMessage} = require("./utils/messages")
const { addUser, removeUser, getUser, getUsersInRoom } = require("./utils/users")
const app = express()
const server = http.createServer(app)
const io = socketio(server)
const port = process.env.PORT || 3000

// directory setting
const publicDir = path.join(__dirname, "../public")


app.use(express.static(publicDir))

app.get("", (req, res) => {
 
})

io.on("connection", (socket) => {
 console.log("New WebSocket connection!!!")

 
 //receiving join event
 socket.on("join", (options, callback) => {
  const { error, user } = addUser({ id: socket.id, ...options })
  if (error) {
   return callback(error)
  }

  socket.join(user.room)

  //sending or wmitting message event to be received by the client
  socket.emit("message", generateMessage("Admin", `Welcome ${user.username}`))
 //broadcasting that a new user is connected to the server without notifying the connected user
  socket.broadcast.to(user.room).emit("message", generateMessage("Admin", `${user.username} has joined`))
  io.to(user.room).emit("roomData", {
   room: user.room,
   users: getUsersInRoom(user.room)
  })
  callback()
 })
 
 //receiving sendMessage event
 socket.on("sendMessage", (userMessage, callback) => {
  const {username, room} = getUser(socket.id)
  const filter = new Filter()
  if (filter.isProfane(userMessage)) {
   return callback("Message must not contain a profane word", undefined)
  }

  if (room) {
   io.to(room).emit("message", generateMessage(username, userMessage))
   callback(undefined, "Message successfully Delivered")
  }
 })

 //receiving sendLocation event
 socket.on("sendLocation", ({ lat, long }, callback) => {
  const {username, room} = getUser(socket.id)
  if (!lat || !long) return callback("there must be Lat and Long", undefined)
  if (room) {
   socket.broadcast.to(room).emit("locationMessage", generateLocationMessage(username, `https://google.com/maps?q=${lat},${long}`))
   callback(undefined, "Location shared!!!")
  }
 })

 //showing mesage for a new disconnected user
 socket.on("disconnect", () => {
  const user = removeUser(socket.id)
  if (user) {
   io.to(user.room).emit("message", generateMessage("Admin", `${user.username} has left`))
   io.to(user.room).emit("roomData", {
    room: user.room,
    users: getUsersInRoom(user.room)
   })
  }
 })
})

server.listen(port, () => {
 console.log(`App is currently running on port ${port}`)
})