const express = require('express')
const path = require('path')
const app = express()

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const dbPath = path.join(__dirname, 'todoApplication.db')

app.use(express.json())
let db = null

const initDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })

    app.listen(3000, () => {
      console.log('Server is running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(e.message)
    process.exit(1)
  }
}
initDbAndServer()

//api1
app.get('/todos/', async (request, response) => {
  // console.log()
  if (request.query.status) {
    request.query.status = request.query.status.replace('%20', ' ')
  }
  const {search_q = '', priority = '', status = ''} = request.query
  const getTodosQuery = `
        SELECT * 
        FROM todo
        WHERE 
        todo LIKE '%${search_q}%' AND
        priority LIKE '%${priority}%' AND
        status LIKE '%${status}%';`
  let todos = await db.all(getTodosQuery)
  response.send(todos)
})

//api2
app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const getRequiredtodoQuery = `
        SELECT * 
        FROM todo
        WHERE id = ${todoId}
    ;`
  let todo = await db.get(getRequiredtodoQuery)

  response.send(todo)
})

//api3
app.post('/todos/', async (request, response) => {
  const todoInfo = request.body
  const {id, todo, priority, status} = todoInfo
  const inserttodoQuery = `
        INSERT INTO todo(id,todo,priority,status)
        VALUES(${id}, '${todo}', '${priority}', '${status}')
    ;`
  await db.run(inserttodoQuery)
  response.send('Todo Successfully Added')
})

//api4
app.put('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const todoInfo = request.body
  const getRequiredTodoQuery = `
        SELECT * 
        FROM todo
        WHERE id = ${todoId}
    ;`
  let requiredTodo = await db.get(getRequiredTodoQuery)
  // console.log(requiredTodo)

  let prev_todo = requiredTodo.todo,
    prev_priority = requiredTodo.priority,
    prev_status = requiredTodo.status

  let msg = ''
  if (todoInfo.todo) msg = 'Todo Updated'
  else if (todoInfo.priority) msg = 'Priority Updated'
  else msg = 'Status Updated'

  const {
    todo = prev_todo,
    priority = prev_priority,
    status = prev_status,
  } = todoInfo

  const getRequiredtodoQuery = `
        UPDATE todo
        SET
        'todo' = '${todo}',
        'priority' = '${priority}',
        'status' = '${status}'
        WHERE id = ${todoId}
    ;`
  await db.run(getRequiredtodoQuery)

  response.send(msg)
})

//api5
app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const deleteTodoQuery = `
        DELETE 
        FROM todo
        WHERE id = ${todoId}
    ;`
  await db.get(deleteTodoQuery)

  response.send('Todo Deleted')
})

module.exports = app
