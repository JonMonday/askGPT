import bot from './assets/bot.svg'
import user from './assets/user.svg'

const form = document.querySelector('form')
const chatContainer = document.querySelector('#chat_container')

let load_interval

function loader(element){
  element.textContent = ''

  load_interval = setInterval( () => {
    element.textContent += '.'
    if(element.textContent === '....'){
      element.textContent = ''
    }
  }, 300)
}

function typeResponse(element, response){
  let index = 0
  let interval = setInterval(() => {
    if (index < response.length) {
      element.innerHTML += response.charAt(index)
      index++
    } else {
      clearInterval(interval)
    }
  }, 20)
}

function generateID(){
  const timestamp = Date.now()
  const randonNumber = Math.random()
  const hexString = randonNumber.toString(16)

  return `id-${timestamp}-${hexString}`
}

function promptStripe (isAi, value, uniqueId){
  return (
    `
    <div class="wrapper ${isAi && 'ai'}">
      <div class="chat">
        <div class="profile">
          <img
            src="${isAi ? bot : user}"
            alt="${isAi ? 'bot' : 'user'}"
          />
        </div>
        <div id="${uniqueId}" class="message"> ${value} </div>
      </div>
    </div>
    `
  )
}

const handleSubmit = async (e) => {
  // prevent reloads from form submission
  e.preventDefault()

  // get data from FORM element
  const data = new FormData(form)

  // create user prompt stripe
  chatContainer.innerHTML += promptStripe(false, data.get('prompt'))
  form.reset() //clear user input

  // create response prompt stripe
  const uniqueId = generateID()
  chatContainer.innerHTML += promptStripe(true, " ", uniqueId)
  chatContainer.scrollTop = chatContainer.scrollHeight // set dynamic response in users view point
  const messageDiv = document.getElementById(uniqueId)
  loader(messageDiv)

  //fetch response from server
  const response = await fetch('https://askgpt-mkz1.onrender.com/', {
    method: 'POST', 
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: data.get('prompt')
    })
  })
  
  // stop loading animation
  clearInterval(load_interval)

  // clear messagediv dots
  messageDiv.innerHTML = ''

  if (response.ok) {
    const data = await response.json()
    const parsedData = data.bot.trim()
    typeResponse(messageDiv, parsedData)
  } else {
    const error = await response.text()
    typeResponse(messageDiv, error)
  }

}

form.addEventListener('submit', handleSubmit)
form.addEventListener('keyup', (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e)
  }
})