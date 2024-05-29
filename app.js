const express = require("express");
const app = express();
app.use(express.json());
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertMoviesDbToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

const convertDirectorDbToResponseObject = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

//Get all Movies Query
app.get("/movies/", async (request, response) => {
  const getAllMoviesQuery = `
    SELECT movie_name 
    FROM movie;
    `;
  const moviesQuery = await db.all(getAllMoviesQuery);
  response.send(
    moviesQuery.map((eachMovies) => convertMoviesDbToResponseObject(eachMovies))
  );
});

//Add new Movie Query
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const addMovieQuery = `
    INSERT INTO 
    movie (director_id, movie_name, lead_actor)
    VALUES(
        ${directorId},
        '${movieName}',
       '${leadActor}'
    );
    `;
  await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

//Get Movie Query
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT * 
    FROM movie 
    WHERE movie_id = ${movieId};
    
    `;
  const movieQuery = await db.get(getMovieQuery);
  response.send(convertMoviesDbToResponseObject(movieQuery));
});

// Update Movie Details Query
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMovieDetailsQuery = `
    UPDATE movie 
    SET 
      director_id = ${directorId},
      movie_name = '${movieName}',
      lead_actor = '${leadActor}'
    WHERE movie_id = ${movieId};
    `;
  await db.run(updateMovieDetailsQuery);
  response.send("Movie Details Updated");
});

// Delete Movie Query
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM 
    movie 
    WHERE movie_id = ${movieId};
    `;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//Get All Directors Query
app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
    SELECT * 
    FROM director;
    `;
  const directorQuery = await db.all(getDirectorsQuery);
  response.send(
    directorQuery.map((eachDirector) =>
      convertDirectorDbToResponseObject(eachDirector)
    )
  );
});

// Get all movie names directed by a specific director
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMovieQuery = `
    SELECT movie_name
    FROM movie 
    WHERE director_id = '${directorId}';`;
  const movieQuery = await db.all(getMovieQuery);
  response.send(
    movieQuery.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

module.exports = app;
