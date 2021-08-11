const express = require("express");
const morgan = require("morgan");
const app = express();
const db = require("./db");
const dotenv = require("dotenv");
const cors = require("cors");
const port = process.env.PORT || 8000;

//middle wares
app.use(express.json());
app.use(morgan("common"));
dotenv.config();
app.use(cors());

//get a restaurant
app.get("/api/vi/restaurants/:id", async (req, res) => {
  try {
    const restaurants = await db.query(
      "select * from restaurants left join (select restaurant_id, count(*), trunc(AVG(rating), 1) as average_rating from reviews group by restaurant_id ) reviews on restaurants.id = reviews.restaurant_id; WHERE id=$1",
      [req.params.id]
    );
    const reviews = await db.query(
      "SELECT * FROM reviews WHERE restaurant_id=$1",
      [req.params.id]
    );
    res.status(200).json({
      status: "success",
      data: {
        restaurants: restaurants.rows[0],
        reviews: reviews.rows,
      },
    });
  } catch (err) {
    console.log(err);
  }
});

//get all restaurants
app.get("/api/vi/restaurants", async (req, res) => {
  try {
    const restaurantData = await db.query(
      "select * from restaurants left join (select restaurant_id, count(*), trunc(AVG(rating), 1) as average_rating from reviews group by restaurant_id ) reviews on restaurants.id = reviews.restaurant_id;"
    );
    res.status(200).json({
      status: "success",
      result: restaurantData.rows.length,
      data: {
        restaurants: restaurantData.rows,
      },
    });
    // console.log(result);
  } catch (err) {
    console.log(err);
  }
});

//create a restaurant
app.post("/api/vi/restaurants", async (req, res) => {
  try {
    const result = await db.query(
      "INSERT INTO restaurants (name,location,price_range) VALUES($1,$2,$3) returning *",
      [req.body.name, req.body.location, req.body.price_range]
    );
    res.status(201).json({
      status: "success",
      data: {
        restaurants: result.rows[0],
      },
    });
  } catch (err) {
    console.log(err);
  }
});

//update a restaurant
app.put("/api/vi/restaurants/:id", async (req, res) => {
  try {
    const result = await db.query(
      "UPDATE restaurants SET name=$1,location=$2,price_range=$3 WHERE id=$4 returning *",
      [req.body.name, req.body.location, req.body.price_range, req.params.id]
    );
    res.status(200).json({
      status: "success",
      data: {
        restaurants: result.rows[0],
      },
    });
  } catch (err) {
    console.log(err);
  }
});

//delete a restaurant
app.delete("/api/vi/restaurants/:id", async (req, res) => {
  try {
    const result = await db.query("delete from restaurants where id = $1", [
      req.params.id,
    ]);
    res.status(204).json({
      status: "success",
    });
  } catch (err) {
    console.log(err);
    res.status(404).json(err);
  }
});

// post a review
app.post("/api/vi/restaurants/:id/addreview", async (req, res) => {
  try {
    const AddReview = await db.query(
      "INSERT INTO reviews (restaurant_id, name, review, rating) VALUES($1,$2,$3,$4) returning *;",
      [req.params.id, req.body.name, req.body.review, req.body.rating]
    );
    res.status(201).json({
      status: "success",
      data: {
        review: AddReview.rows[0],
      },
    });
  } catch (err) {
    console.log(err);
  }
});
app.listen(port, () => {
  console.log(`Backend is running at port${port}`);
});
