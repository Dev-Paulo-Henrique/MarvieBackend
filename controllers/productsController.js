const db = require("../config/db");

exports.getProducts = (req, res) => {
  db.query("SELECT p.*, JSON_ARRAYAGG(r.rating) ratings FROM products p LEFT JOIN reviews r ON p.id = r.product_id GROUP BY p.id", (err, results) => {
    if (err) {
      return res.status(500).send(err.message);
    }
    res.json(results);
  });
};

exports.getProductById = (req, res) => {
  const productId = req.params.id;

  db.query(
    "SELECT p.*, JSON_ARRAYAGG(r.rating) AS ratings FROM products p LEFT JOIN reviews r ON p.id = r.product_id WHERE p.id = ? GROUP BY p.id",
    [productId],
    (err, results) => {
      if (err) {
        return res.status(500).send(err.message);
      }
      res.json(results);
    }
  );
};

exports.createProduct = (req, res) => {
  const {
    nome,
    descricao,
    estoque,
    valor,
    cat_id,
    status,
    image_id,
    sizes,
    colors,
  } = req.body;
  const imageIdJson = Array.isArray(image_id)
    ? JSON.stringify(image_id)
    : image_id;
  const sizesJson = Array.isArray(sizes) ? JSON.stringify(sizes) : sizes;
  const colorsJson = Array.isArray(colors) ? JSON.stringify(colors) : colors;
  const sql =
    "INSERT INTO products (nome, descricao, estoque, valor, cat_id, status, image_id, sizes, colors) VALUES (?,?,?,?,?,?,?,?,?)";
  const values = [
    nome,
    descricao,
    estoque,
    valor,
    cat_id,
    status,
    imageIdJson,
    sizesJson,
    colorsJson,
  ];
  db.query(sql, values, (err, results) => {
    if (err) {
      res.status(500).send(err.message);
      return;
    }
    res.status(201).json({ id: results.insertID });
  });
};

exports.putProduct = (req, res) => {
  const id = req.params.id;
  const { nome, descricao, estoque, valor, cat_id, status, image_id } =
    req.body;

  const imageIdJson = Array.isArray(image_id)
    ? JSON.stringify(image_id)
    : image_id;

  db.query(
    "UPDATE products SET nome = ?, descricao = ?, estoque = ?, valor = ?, cat_id = ?, status = ?, image_id = ? WHERE id = ?",
    [nome, descricao, estoque, valor, cat_id, status, imageIdJson, id],
    (err, results) => {
      if (err) {
        res.status(500).send(err.message);
        return;
      }
      if (results.affectedRows === 0) {
        res.status(404).send("Produto não encontrado");
        return;
      }
      res.sendStatus(204);
    }
  );
};

exports.deleteProduct = (req, res) => {
  const id = req.params.id;
  db.query("DELETE FROM products WHERE id = ?", [id], (err, results) => {
    if (err) {
      res.status(500).send(err.message);
      return;
    }
    if (results.affectedRows === 0) {
      res.status(404).send("Produto não encontrado");
      return;
    }
    res.sendStatus(204);
  });
};
