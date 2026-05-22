// Lightweight validation without external deps

const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    errors.push("Name must be at least 2 characters.");
  }
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    errors.push("A valid email is required.");
  }
  if (!password || password.length < 6) {
    errors.push("Password must be at least 6 characters.");
  }

  if (errors.length) {
    return res.status(400).json({ status: "error", message: "Validation failed", errors });
  }
  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) errors.push("A valid email is required.");
  if (!password) errors.push("Password is required.");

  if (errors.length) {
    return res.status(400).json({ status: "error", message: "Validation failed", errors });
  }
  next();
};

const validateNote = (req, res, next) => {
  const { title, content, tags } = req.body;
  const errors = [];

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    errors.push("Title is required.");
  } else if (title.trim().length > 100) {
    errors.push("Title cannot exceed 100 characters.");
  }

  if (!content || typeof content !== "string" || content.trim().length === 0) {
    errors.push("Content is required.");
  } else if (content.trim().length > 10000) {
    errors.push("Content cannot exceed 10,000 characters.");
  }

  if (tags !== undefined) {
    if (!Array.isArray(tags)) {
      errors.push("Tags must be an array.");
    } else if (tags.length > 10) {
      errors.push("A note can have at most 10 tags.");
    } else if (tags.some((t) => typeof t !== "string")) {
      errors.push("Each tag must be a string.");
    }
  }

  if (errors.length) {
    return res.status(400).json({ status: "error", message: "Validation failed", errors });
  }
  next();
};

const validateNoteUpdate = (req, res, next) => {
  const { title, content, tags, isPinned } = req.body;
  const errors = [];

  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({ status: "error", message: "No fields provided to update." });
  }

  if (title !== undefined) {
    if (typeof title !== "string" || title.trim().length === 0) errors.push("Title cannot be empty.");
    else if (title.trim().length > 100) errors.push("Title cannot exceed 100 characters.");
  }

  if (content !== undefined) {
    if (typeof content !== "string" || content.trim().length === 0) errors.push("Content cannot be empty.");
    else if (content.trim().length > 10000) errors.push("Content cannot exceed 10,000 characters.");
  }

  if (tags !== undefined) {
    if (!Array.isArray(tags)) errors.push("Tags must be an array.");
    else if (tags.length > 10) errors.push("A note can have at most 10 tags.");
    else if (tags.some((t) => typeof t !== "string")) errors.push("Each tag must be a string.");
  }

  if (isPinned !== undefined && typeof isPinned !== "boolean") {
    errors.push("isPinned must be a boolean.");
  }

  if (errors.length) {
    return res.status(400).json({ status: "error", message: "Validation failed", errors });
  }
  next();
};

module.exports = { validateRegister, validateLogin, validateNote, validateNoteUpdate };