const users = []

//addUser, removeUser, getUser, getAllUsers

const addUser = ({ id, username, room }) => {
 //refactory incoming data
 username = username.trim().toLowerCase()
 room = room.trim().toLowerCase()

 //Checking or validating incoming data
 if (!username || !room) return { error: "Please provide username and room" }

 //Check for exisiting user
 const exisitingUser = users.find((user) => {
  return user.username === username && user.room === room
 })

 //validate user
 if (exisitingUser) return { error: "username already exist" }

 //store new user
 const user = {id, username, room}
 users.push(user)
 return {user}
}

const removeUser = (id) => {
 const userIndex = users.findIndex((user) => user.id === id)
 if (userIndex > -1) {
  return users.splice(userIndex, 1)[0]
 }

}

const getUser = (id) => {
 const user = users.find((user) => user.id === id)

 if (!user) {
  return {
   error: "User not found!!!"
  }
 }

 return user
}

//Get users in a room
const getUsersInRoom = (room) => {
 room = room.trim().toLowerCase()
 const usersInRoom = users.filter((user) => user.room === room)

 return usersInRoom
}
module.exports = {
 addUser,
 removeUser,
 getUser,
 getUsersInRoom
}