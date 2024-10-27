const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();
app.use(express.json());

// These should be in .env
const JWT_SECRET = "simple";
const JWT_EXPIRE_IN = "1h";

// Helper: hash password
const SALT_LENGTH = 10;
const hashPassword = async (password) =>
  await bcrypt.hash(password, SALT_LENGTH);

// Available permissions
const PERMISSIONS = {
  read: "read",
  write: "write",
  delete: "delete",
};

// Available roles
const ROLES = {
  admin: "admin",
  user: "user",
};

// Permissions of each role
const ROLE_PERMISSIONS = {
  [ROLES.admin]: [PERMISSIONS.read, PERMISSIONS.write, PERMISSIONS.delete],
  [ROLES.user]: [PERMISSIONS.read],
};

// Create sample users
let users;
(async () => [
  {
    id: 1,
    username: "admin",
    password: await hashPassword("admin"),
    role: ROLES.admin,
  },
  {
    id: 2,
    username: "admin",
    password: await hashPassword("user"),
    role: ROLES.user,
  },
])().then((data) => {
  users = data;
});

// Login route
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = users.find((u) => u.username === username);
  if (!user || (await bcrypt.compare(password, user.password))) {
    res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRE_IN,
  });

  res.json({ token });
});

// Middleware to verify token
const checkAuthentication = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
  }

  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err) {
      res.status(401).json({ message: "Invalid token" });
    }
    req.user = payload;
    next();
  });
};

// Middleware to check permissions (place after checkAuthentication)
const checkPermissions = (requiredPermissions) => (req, res, next) => {
  const rolePermissions = ROLE_PERMISSIONS[req.user.role];
  if (
    !rolePermissions.every((permission) =>
      requiredPermissions.includes(permission)
    )
  ) {
    res.status(403).json({ message: "Forbidden" });
  }

  next();
};

// Example protected routes
app.patch(
  "/update",
  checkAuthentication,
  checkPermissions([PERMISSIONS.read, PERMISSIONS.write]),
  (req, res) => {
    res.json({ message: "You have access to update data" });
  }
);

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});