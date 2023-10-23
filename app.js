const express = require("express");
const app = express();
app.use(express.json());
const { open } = require("sqlite");
const path = require("path");
const dbPath = path.join(__dirname, "todoApplications.db");
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

module.exports = app;
