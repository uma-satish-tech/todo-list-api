const express = require("express");
const app = express();
app.use(express.json());
const { open } = require("sqlite");
const path = require("path");
const dbPath = path.join(__dirname, "todoApplication.db");
const sqlite3 = require("sqlite3");

let db = null;
const initializedDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3001, () => {
      console.log("server started running at localhost:3001");
    });
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};

initializedDBAndServer();

dbObjectToResponseObj = (dbObject) => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    priority: dbObject.priority,
    status: dbObject.status,
  };
};

//get all todo

const hasPriorityAndStatus = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasPriority = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatus = (requestQuery) => {
  return requestQuery.status !== undefined;
};

app.get("/todos/", async (request, response) => {
  const { search_q = "", priority, status } = request.query;
  let getTodosQuery = "";
  let data = null;

  switch (true) {
    case hasPriorityAndStatus(request.query):
      getTodosQuery = `
          SELECT * FROM todo
          WHERE 
          todo LIKE '%${search_q}%'
          AND status = '${status}'
          AND priority = '${priority}';
         `;
      break;
    case hasPriority(request.query):
      getTodosQuery = `
          SELECT * FROM todo
          WHERE
          todo LIKE '%${search_q}%'
          AND priority = '${priority}';
          `;
      break;
    case hasStatus(request.query):
      getTodosQuery = `
          SELECT * FROM todo
          WHERE
          todo LIKE '%${search_q}%'
          AND status = '${status}';
          `;
      break;
    default:
      getTodosQuery = `
          SELECT * FROM todo
          WHERE todo LIKE '%${search_q}%';
          `;
      break;
  }

  data = await db.all(getTodosQuery);
  response.send(data);
});

// get particular todo based on todoID

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoItem = `
    SELECT * FROM todo WHERE id = ${todoId};
    `;
  const item = await db.get(getTodoItem);
  response.send(item);
});

// create todo item in todo table

app.post("/todos/", async (request, response) => {
  const todoDetails = request.body;
  const { id, todo, priority, status } = todoDetails;
  const addTodoQuery = `
    INSERT INTO todo (id , todo , priority , status)
    VALUES (
        ${id},
       '${todo}',
       '${priority}',
        '${status}'
    );
    `;
  await db.run(addTodoQuery);
  response.send("Todo Successfully Added");
});

// update todo item

app.put("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const reqBody = request.body;
  let updateColumn = "";
  switch (true) {
    case reqBody.status !== undefined:
      updateColumn = "Status";
      break;
    case reqBody.priority !== undefined:
      updateColumn = "Priority";
      break;
    case reqBody.todo !== undefined:
      updateColumn = "Todo";
      break;
  }

  const previousTodoQuery = `
  SELECT * FROM todo WHERE id = ${todoId};
  `;

  const previousTodo = await db.get(previousTodoQuery);
  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
  } = request.body;

  const updateTodoQuery = `
  UPDATE 
  todo
  SET 
  todo = '${todo}',
  priority = '${priority}',
  status = '${status}'
  WHERE 
  id = ${todoId};
  `;

  await db.run(updateTodoQuery);
  response.send(`${updateColumn} Updated`);
});

// delete specific todo based on id

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteQuery = `
   DELETE FROM todo WHERE id = ${todoId};
   `;
  await db.run(deleteQuery);
  response.send("Todo Deleted");
});

module.exports = app;
