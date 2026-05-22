const Note = require("../models/Note");

// ─── Helpers ────────────────────────────────────────────────────────────────

const noteNotFound = (res) =>
  res.status(404).json({ status: "error", message: "Note not found." });

// ─── GET /api/notes ──────────────────────────────────────────────────────────
// List all notes belonging to the authenticated user.
// Supports: ?page, ?limit, ?tags, ?pinned, ?search, ?sort
const getNotes = async (req, res) => {
  const { page = 1, limit = 20, tags, pinned, search, sort = "-createdAt" } = req.query;

  const filter = { user: req.user._id };

  if (pinned !== undefined) filter.isPinned = pinned === "true";

  if (tags) {
    const tagList = tags.split(",").map((t) => t.trim()).filter(Boolean);
    if (tagList.length) filter.tags = { $in: tagList };
  }

  if (search) {
    const regex = new RegExp(search, "i");
    filter.$or = [{ title: regex }, { content: regex }];
  }

  const allowedSorts = ["createdAt", "-createdAt", "updatedAt", "-updatedAt", "title", "-title"];
  const safeSort = allowedSorts.includes(sort) ? sort : "-createdAt";

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;

  const [notes, total] = await Promise.all([
    Note.find(filter).sort(safeSort).skip(skip).limit(limitNum).select("-__v"),
    Note.countDocuments(filter),
  ]);

  res.status(200).json({
    status: "success",
    results: notes.length,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    },
    data: { notes },
  });
};

// ─── GET /api/notes/:id ──────────────────────────────────────────────────────
const getNoteById = async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, user: req.user._id }).select("-__v");
  if (!note) return noteNotFound(res);

  res.status(200).json({ status: "success", data: { note } });
};

// ─── POST /api/notes ─────────────────────────────────────────────────────────
const createNote = async (req, res) => {
  const { title, content, tags, isPinned } = req.body;

  const note = await Note.create({
    user: req.user._id,
    title: title.trim(),
    content: content.trim(),
    tags: tags || [],
    isPinned: isPinned || false,
  });

  res.status(201).json({ status: "success", data: { note } });
};

// ─── PATCH /api/notes/:id ────────────────────────────────────────────────────
const updateNote = async (req, res) => {
  const { title, content, tags, isPinned } = req.body;

  const updates = {};
  if (title !== undefined) updates.title = title.trim();
  if (content !== undefined) updates.content = content.trim();
  if (tags !== undefined) updates.tags = tags;
  if (isPinned !== undefined) updates.isPinned = isPinned;

  const note = await Note.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id }, // ownership enforced here
    updates,
    { new: true, runValidators: true }
  ).select("-__v");

  if (!note) return noteNotFound(res);

  res.status(200).json({ status: "success", data: { note } });
};

// ─── DELETE /api/notes/:id ───────────────────────────────────────────────────
const deleteNote = async (req, res) => {
  const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!note) return noteNotFound(res);

  res.status(200).json({ status: "success", message: "Note deleted.", data: null });
};

module.exports = { getNotes, getNoteById, createNote, updateNote, deleteNote };