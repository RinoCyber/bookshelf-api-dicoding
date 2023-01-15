const { nanoid } = require("nanoid");
const { constants } = require("http2");
const notes = require("./notes");
const books = require("./books");

// excercise notes API
const addNoteHandler = (request, h) => {
  const { title, tags, body } = request.payload;
  const id = nanoid(16);
  const createdAt = new Date().toISOString();
  const updatedAt = createdAt;

  const newNote = {
    id,
    title,
    tags,
    body,
    createdAt,
    updatedAt,
  };
  notes.push(newNote);
  const isSuccesPushNote = notes.filter((note) => note.id === id).length > 0;
  let response = h
    .response({
      status: "error",
      message: "Catatan gagal ditambahkan",
    })
    .code(500);

  if (isSuccesPushNote) {
    response = h
      .response({
        status: "success",
        message: "Catatan berhasil ditambahkan",
        data: {
          noteId: id,
          notes: notes,
        },
      })
      .code(201);
  }

  return response;
};

const getAllNotesHandler = () => ({
  status: "success",
  data: {
    notes,
  },
});

const getNoteByIdHandler = (request, h) => {
  const { id } = request.params;

  const note = notes.filter((n) => n.id === id)[0];
  let response = h
    .response({
      status: "fail",
      message: "Catatan tidak ditemukan",
    })
    .code(404);

  if (note !== undefined) {
    response = h
      .response({
        status: "success",
        data: { note },
      })
      .code(200);
  }

  return response;
};

const editNoteByIdHandler = (request, h) => {
  const { id } = request.params;
  const { title, tags, body } = request.payload;
  const updatedAt = new Date().toISOString();
  const index = notes.findIndex((note) => note.id === id);
  let response = h
    .response({
      status: "fail",
      message: "Gagal memperbarui catatan. Id tidak ditemukan",
    })
    .code(500);

  if (index !== -1) {
    notes[index] = {
      ...notes[index],
      title,
      tags,
      body,
      updatedAt,
    };
    response = h
      .response({
        status: "success",
        message: "Catatan berhasil diperbarui",
      })
      .code(200);
  }

  return response;
};

const deleteNoteByIdHandler = (request, h) => {
  const { id } = request.params;
  const index = notes.findIndex((note) => note.id === id);
  let response = h
    .response({
      status: "fail",
      message: "Catatan gagal dihapus. Id tidak ditemukan",
    })
    .code(404);

  if (index !== -1) {
    notes.splice(index, 1);
    response = h
      .response({
        status: "success",
        message: "Catatan berhasil dihapus",
      })
      .code(200);
  }

  return response;
};

// bookshelf API handler
const addBookHandler = (request, h) => {
  const reqPayload = request.payload;
  let response = h
    .response({
      status: "error",
      message: "Buku gagal ditambahkan",
    })
    .code(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);

  if (!reqPayload.name) {
    return h
      .response({
        status: "fail",
        message: "Gagal menambahkan buku. Mohon isi nama buku",
      })
      .code(constants.HTTP_STATUS_BAD_REQUEST);
  }

  if (reqPayload.readPage > reqPayload.pageCount) {
    return h
      .response({
        status: "fail",
        message:
          "Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount",
      })
      .code(constants.HTTP_STATUS_BAD_REQUEST);
  }

  const id = nanoid(16);
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;
  const finished = reqPayload.pageCount === reqPayload.readPage;
  const newBook = {
    id,
    name: reqPayload.name,
    year: reqPayload.year,
    author: reqPayload.author,
    summary: reqPayload.summary,
    publisher: reqPayload.publisher,
    pageCount: reqPayload.pageCount,
    readPage: reqPayload.readPage,
    finished,
    reading: reqPayload.reading,
    insertedAt,
    updatedAt,
  };
  books.push(newBook);
  const newBookInserted = books.filter((book) => book.id === id).length > 0;
  if (newBookInserted) {
    response = h
      .response({
        status: "success",
        message: "Buku berhasil ditambahkan",
        data: {
          bookId: id,
        },
      })
      .code(constants.HTTP_STATUS_CREATED);
  }

  return response;
};

const getAllBooksHandler = (request) => {
  let filteredBooks = [...books];
  const { name, reading, finished } = request.query;
  const numReading = Number.parseInt(reading, 10);
  const numFinished = Number.parseInt(finished, 10);

  if (name !== undefined && name.trim().length > 0) {
    filteredBooks = filteredBooks.filter((book) =>
      book.name.toLowerCase().includes(name.toLowerCase())
    );
  }

  if (!Number.isNaN(numReading)) {
    filteredBooks = filteredBooks.filter(
      (book) => book.reading === !!numReading
    );
  }

  if (!Number.isNaN(numFinished)) {
    filteredBooks = filteredBooks.filter(
      (book) => book.finished === !!numFinished
    );
  }

  return {
    status: "success",
    data: {
      books: filteredBooks.map((book) => ({
        id: book.id,
        name: book.name,
        publisher: book.publisher,
      })),
    },
  };
};

const getBookByIdHandler = (request, h) => {
  const { bookId } = request.params;
  const book = books.find((item) => item.id === bookId);
  let response = h
    .response({
      status: "fail",
      message: "Buku tidak ditemukan",
    })
    .code(constants.HTTP_STATUS_NOT_FOUND);

  if (book !== undefined) {
    response = h
      .response({
        status: "success",
        data: { book },
      })
      .code(constants.HTTP_STATUS_OK);
  }

  return response;
};

const editBookByIdHandler = (request, h) => {
  const { bookId } = request.params;
  const reqBody = request.payload;
  const index = books.findIndex((book) => book.id === bookId);
  let response = h
    .response({
      status: "fail",
      message: "Gagal memperbarui buku. Id tidak ditemukan",
    })
    .code(constants.HTTP_STATUS_NOT_FOUND);

  if (!reqBody.name) {
    return h
      .response({
        status: "fail",
        message: "Gagal memperbarui buku. Mohon isi nama buku",
      })
      .code(constants.HTTP_STATUS_BAD_REQUEST);
  }
  if (reqBody.readPage > reqBody.pageCount) {
    return h
      .response({
        status: "fail",
        message:
          "Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount",
      })
      .code(constants.HTTP_STATUS_BAD_REQUEST);
  }

  if (index !== -1) {
    books[index] = {
      ...books[index],
      name: reqBody.name,
      year: reqBody.year,
      author: reqBody.author,
      summary: reqBody.summary,
      publisher: reqBody.publisher,
      pageCount: reqBody.pageCount,
      readPage: reqBody.readPage,
      reading: reqBody.reading,
      updatedAt: new Date().toISOString(),
    };
    response = h
      .response({
        status: "success",
        message: "Buku berhasil diperbarui",
      })
      .code(constants.HTTP_STATUS_OK);
  }

  return response;
};

const deleteBookByIdHandler = (request, h) => {
  const { bookId } = request.params;
  const index = books.findIndex((book) => book.id === bookId);
  let response = h
    .response({
      status: "fail",
      message: "Buku gagal dihapus. Id tidak ditemukan",
    })
    .code(constants.HTTP_STATUS_NOT_FOUND);
  if (index !== -1) {
    books.splice(index, 1);
    response = h
      .response({
        status: "success",
        message: "Buku berhasil dihapus",
      })
      .code(constants.HTTP_STATUS_OK);
  }

  return response;
};

module.exports = {
  // noteHandler
  addNoteHandler,
  getAllNotesHandler,
  getNoteByIdHandler,
  editNoteByIdHandler,
  deleteNoteByIdHandler,
  // bookHandler
  addBookHandler,
  getAllBooksHandler,
  getBookByIdHandler,
  editBookByIdHandler,
  deleteBookByIdHandler,
};
