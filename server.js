const express = require("express");
const app = express();
const path = require("path");
const handlebars = require("express-handlebars");
const session = require("express-session");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname + "/public/img/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});
const upload = multer({ storage: storage });

const port = 8081;

let products = [
  {
    id: 1,
    name: "iPhone XS",
    price: "1,199",
    img: "ip-img.jpg",
    desc: "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Provident voluptatesesse atque hic. Cumque mollitia, in, quia exercitationem, sapiente modiaspernatur quod sunt asperiores aut odio odit inventore tempore cupiditate.Velit consequuntur porro facere accusantium molestiae veritatis placeat inquidem, maiores ratione amet a vero iure corporis. Officia possimus neque veniammollitia pariatur rerum totam omnis tenetur, quo assumenda ut?",
  },
  {
    id: 2,
    name: "iPhone 12 Pro",
    price: "1,399",
    img: "ip-img.jpg",
    desc: "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Provident voluptatesesse atque hic. Cumque mollitia, in, quia exercitationem, sapiente modiaspernatur quod sunt asperiores aut odio odit inventore tempore cupiditate.Velit consequuntur porro facere accusantium molestiae veritatis placeat inquidem, maiores ratione amet a vero iure corporis. Officia possimus neque veniammollitia pariatur rerum totam omnis tenetur, quo assumenda ut?",
  },
  {
    id: 3,
    name: "iPhone 16",
    price: "1,599",
    img: "ip-img.jpg",
    desc: "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Provident voluptatesesse atque hic. Cumque mollitia, in, quia exercitationem, sapiente modiaspernatur quod sunt asperiores aut odio odit inventore tempore cupiditate.Velit consequuntur porro facere accusantium molestiae veritatis placeat inquidem, maiores ratione amet a vero iure corporis. Officia possimus neque veniammollitia pariatur rerum totam omnis tenetur, quo assumenda ut?",
  },
  {
    id: 4,
    name: "iPhone 16 Pro",
    price: "1,799",
    img: "ip-img.jpg",
    desc: "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Provident voluptatesesse atque hic. Cumque mollitia, in, quia exercitationem, sapiente modiaspernatur quod sunt asperiores aut odio odit inventore tempore cupiditate.Velit consequuntur porro facere accusantium molestiae veritatis placeat inquidem, maiores ratione amet a vero iure corporis. Officia possimus neque veniammollitia pariatur rerum totam omnis tenetur, quo assumenda ut?",
  },
  {
    id: 5,
    name: "iPhone 16 Pro Max",
    price: "1,999",
    img: "ip-img.jpg",
    desc: "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Provident voluptatesesse atque hic. Cumque mollitia, in, quia exercitationem, sapiente modiaspernatur quod sunt asperiores aut odio odit inventore tempore cupiditate.Velit consequuntur porro facere accusantium molestiae veritatis placeat inquidem, maiores ratione amet a vero iure corporis. Officia possimus neque veniammollitia pariatur rerum totam omnis tenetur, quo assumenda ut?",
  },
];

app.engine("handlebars", handlebars.engine());
app.set("view engine", "handlebars");
app.set("views", "./views");

app.use(
  session({
    secret: "my secret session",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true },
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(__dirname + "/public/img"));

app.get("/", (req, res) => {
  if (!req.session.username) {
    return res.redirect("/login");
  }
  return res.render("home", { products });
});

app.get("/login", (req, res) => {
  if (!req.session.username) {
    return res.render("login");
  }
  return res.redirect("/");
});

app.post("/login", (req, res) => {
  let username = req.body.email;
  let password = req.body.password;

  if (process.env.USER_ID == username && process.env.USER_KEY == password) {
    req.session.username = username;
    return res.redirect("/");
  }
  return res.render("login", { msg: "Wrong username or password" });
});

app.get("/add", (req, res) => {
  return res.render("add");
});

app.post("/add", upload.single("img"), (req, res) => {
  const { name, price, desc } = req.body;
  if (!name || !price || !desc || !req.file) {
    return res.render("add", { msg: "Vui lòng nhập đầy đủ thông tin" });
  }
  let id = products.length + 1;
  let img = req.file.filename;
  products.push({ id, name, price, img, desc });
  return res.redirect("/");
});

app.get("/edit/:id", (req, res) => {
  let id = req.params.id;
  let item = products.find((p) => p.id == id);
  return res.render("edit", { data: item });
});

app.post("/edit/:id", upload.single("img"), (req, res) => {
  let id = req.params.id;
  let idx = products.findIndex((p) => p.id == id);
  const { name, price, desc } = req.body;
  console.log(req.body);
  const img = !req.file ? products[idx].img : req.file.filename;
  const data = { id, name, price, img, desc };

  if (!id || !name || !price || !desc) {
    return res.render("edit", { data, msg: "Vui lòng nhập đầy đủ thông tin" });
  }
  products[idx] = data;
  return res.redirect("/");
});

app.get("/delete/:id", (req, res) => {
  let id = req.params.id;
  let idx = products.findIndex((p) => p.id == id);
  products.splice(idx, 1);
  return res.redirect("/");
});

app.get("/:id", (req, res) => {
  let id = req.params.id;
  let item = products.find((p) => p.id == id);
  if (!item) return res.send({ status: 400, msg: "Product not found" });
  return res.render("details", item);
});

app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});
