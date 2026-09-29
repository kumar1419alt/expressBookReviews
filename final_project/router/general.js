const express = require('express');
const axios = require('axios');

let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;

const public_users = express.Router();

// Register user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: "Username and password are required"
    });
  }

  if (!isValid(username)) {
    return res.status(400).json({
      message: "Username already exists"
    });
  }

  users.push({ username, password });

  return res.status(200).json({
    message: "User successfully registered"
  });
});

// Get all books using Axios and async/await
public_users.get('/', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:5000/internal/books');
    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving books"
    });
  }
});

// Internal route for all books
public_users.get('/internal/books', (req, res) => {
  res.json(books);
});

// Get book by ISBN using Axios and async/await
public_users.get('/isbn/:isbn', async (req, res) => {
  try {
    const response = await axios.get(
      `http://localhost:5000/internal/isbn/${req.params.isbn}`
    );

    res.json(response.data);
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({
        message: "Error retrieving book"
      });
    }
  }
});

// Internal route for ISBN
public_users.get('/internal/isbn/:isbn', (req, res) => {
  const isbn = req.params.isbn;

  if (books[isbn]) {
    res.json(books[isbn]);
  } else {
    res.status(404).json({
      message: "Book not found"
    });
  }
});

// Get books by author using Axios and async/await
public_users.get('/author/:author', async (req, res) => {
  try {
    const response = await axios.get(
      `http://localhost:5000/internal/author/${encodeURIComponent(req.params.author)}`
    );

    res.json(response.data);
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({
        message: "Error retrieving books by author"
      });
    }
  }
});

// Internal route for author
public_users.get('/internal/author/:author', (req, res) => {
  const author = req.params.author;
  const result = {};

  for (let isbn in books) {
    if (books[isbn].author.toLowerCase() === author.toLowerCase()) {
      result[isbn] = books[isbn];
    }
  }

  res.json(result);
});

// Get books by title using Axios and async/await
public_users.get('/title/:title', async (req, res) => {
  try {
    const response = await axios.get(
      `http://localhost:5000/internal/title/${encodeURIComponent(req.params.title)}`
    );

    res.json(response.data);
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({
        message: "Error retrieving books by title"
      });
    }
  }
});

// Internal route for title
public_users.get('/internal/title/:title', (req, res) => {
  const title = req.params.title;
  const result = {};

  for (let isbn in books) {
    if (books[isbn].title.toLowerCase() === title.toLowerCase()) {
      result[isbn] = books[isbn];
    }
  }

  res.json(result);
});

// Get book review
public_users.get('/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;

  if (books[isbn]) {
    res.json(books[isbn].reviews);
  } else {
    res.status(404).json({
      message: "Book not found"
    });
  }
});

module.exports.general = public_users;