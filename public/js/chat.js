const socket = io()
const message = document.querySelector(".message")
const sendButton = document.querySelector(".send-button")
const sendLocation = document.querySelector(".send-location")
// Location of where the compiled template will appear
const messages = document.querySelector("#messages")
const sidebarContent = document.querySelector("#sidebar-content")
//Templates
const messageTemplate = document.querySelector("#message-template").innerHTML
const locationTemplate = document.querySelector("#location-template").innerHTML
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML

//location
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoScroll = () => {
  // New message element
  const newMessage = messages.lastElementChild
  //new Message Height
  const newMessageStyles = getComputedStyle(newMessage)
  const newMessageMargin = parseInt(newMessageStyles.marginBottom)
  const newMessageHeight = newMessage.offsetHeight + newMessageMargin

  //Visible height
  const visibleHeight = messages.offsetHeight

  //Height of messages container
  const containerHeight = messages.scrollHeight

  //How far Have I scrolled
  const scrollOffSet = messages.scrollTop + visibleHeight

  if (containerHeight - newMessageHeight <= scrollOffSet) {
    messages.scrollTop = messages.scrollHeight
  }
}

socket.on("message", (data) => {
  //Compiling the template using Handlerbar
  const template = Handlebars.compile(messageTemplate)
  var context = {
    username: data.username,
    message: data.text,
    createdAt: moment(data.createdAt).format("h:mm a")
  }
  const html = template(context)
  messages.insertAdjacentHTML("beforeend", html)
  autoScroll()
})

socket.on("locationMessage", (data) => {
  const template = Handlebars.compile(locationTemplate)
  const context = {
    username: data.username,
    url: data.url,
    createdAt: moment(data.createdAt).format("h:mm a")
  }
  const html = template(context)
  messages.insertAdjacentHTML("beforeend", html)
  autoScroll()
})

socket.on("roomData", (data) => {
  const template = Handlebars.compile(sidebarTemplate)
  const context = {
    room: data.room,
    users: data.users
  }
  const html = template(context)
  sidebarContent.innerHTML = html

})

sendButton.addEventListener("click", (e) => {
 e.preventDefault()
 sendButton.setAttribute("disabled", "disabled")
 
 const userMessage = message.value === "" ? undefined : message.value
 sendButton.removeAttribute("disabled")
 if (userMessage) {
  socket.emit("sendMessage", userMessage, (error, acknowledged) => {
   if (error) return console.log(error)
   console.log(acknowledged)   
  })
 }
 message.value = ""
 message.focus()
})

sendLocation.addEventListener("click", () => {
 sendLocation.setAttribute("disabled", "disabled")
 if(!navigator.geolocation) return alert("Your browser doesn't support geolocation")
 
 navigator.geolocation.getCurrentPosition((position) => {
  socket.emit("sendLocation", {
   lat: position.coords.latitude,
   long: position.coords.longitude
  }, (error, acknowledged) => {
    if(error) console.log(error)
    console.log(acknowledged)
    // sendLocation.removeAttribute("disabled")
  })
 })
})

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error)
    location.href = "/"
  }
})