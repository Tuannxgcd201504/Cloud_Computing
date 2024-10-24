var express = require("express");
var router = express.Router();
const pool = require("../models/pg_connector");

function generateProductTable(rows) {
  let table = `<table border="1">
                <tr>
                  <th>ID</th>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Shop ID</th>
                  <th>Amount</th>
                  <th>CRUD</th>
                </tr>
                <tr>
                  <form action="/users" method="POST">
                    <td><input type="text" name="id" placeholder="Auto" disabled></td>
                    <td><input type="text" name="product" placeholder="New product" required></td>
                    <td><input type="number" name="price" placeholder="Price" required step="0.01"></td>
                    <td><input type="number" name="shop_id" placeholder="Shop ID" required></td>
                    <td><input type="number" name="amount" placeholder="Amount" required></td>
                    <td><input type="submit" name="btn" value="Add"></td>
                  </form>
                </tr>`;

  rows.forEach((row) => {
    table += `<tr>
                <form action="/users" method="POST">
                  <td><input type="text" name="id" value="${row.id}" readonly></td>
                  <td><input type="text" name="product" value="${row.product_name}" required></td>
                  <td><input type="number" name="price" value="${row.price}" required step="0.01"></td>
                  <td><input type="number" name="shop_id" value="${row.shop_id}" required></td>
                  <td><input type="number" name="amount" value="${row.amount}" required></td>
                  <td>
                    <input type="submit" name="btn" value="Update">
                    <input type="submit" name="btn" value="Delete">
                  </td>
                </form>
              </tr>`;
  });

  table += `</table>`;
  return table;
}

/* GET users listing. */
router.get("/", function (req, res, next) {
  let authented = req.session.authented;

  if (!authented) {
    return res.redirect("/login");
  }

  // Query product list from database
  pool.query(
    "SELECT id, product_name, price, shop_id, amount FROM products",
    (err, result) => {
      if (err) {
        console.error("Error query:", err);
        return res.status(500).send("Database query error");
      }

      // Create product table from query results
      const table = generateProductTable(result.rows);

      // Render users page with product table
      res.render("users", { title: "Users page", products_table: table });
    }
  );
});

/* POST users CRUD. */
router.post("/", function (req, res, next) {
  const { id, product, price, shop_id, amount, btn } = req.body;

  if (btn === "Add") {
    // Add new product
    console.log("Adding product:", product, price, shop_id, amount);
    if (product && price && shop_id && amount) {
      pool.query(
        "INSERT INTO products (product_name, price, shop_id, amount) VALUES ($1, $2, $3, $4)",
        [product, price, shop_id, amount],
        (err) => {
          if (err) {
            console.error("Error adding product:", err);
            return res.status(500).send("Error adding product");
          }
          return res.redirect("/users"); // Redirect to GET /users
        }
      );
    } else {
      return res.status(400).send("All fields cannot be left blank!");
    }
  } else if (btn === "Update") {
    // Update product
    if (id && product && price && shop_id && amount) {
      pool.query(
        "UPDATE products SET product_name = $1, price = $2, shop_id = $3, amount = $4 WHERE id = $5",
        [product, price, shop_id, amount, id],
        (err) => {
          if (err) {
            console.error("Error while updating product:", err);
            return res.status(500).send("Error while updating product");
          }
          return res.redirect("/users");
        }
      );
    } else {
      return res.status(400).send("All fields cannot be empty when updating!");
    }
  } else if (btn === "Delete") {
    // Delete product
    if (id) {
      pool.query("DELETE FROM products WHERE id = $1", [id], (err) => {
        if (err) {
          console.error("Error while deleting product:", err);
          return res.status(500).send("Error while deleting product");
        }
        return res.redirect("/users");
      });
    } else {
      return res
        .status(400)
        .send("Product ID cannot be left blank when deleting!");
    }
  }
});

module.exports = router;
