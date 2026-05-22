const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Notes REST API",
      version: "1.0.0",
      description:
        "A CRUD REST API for managing personal notes with JWT authentication and resource ownership enforcement.",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Local development server",
      },
      {
        url: "https://note-rest-api",
        description: "production",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT token from /api/auth/login or /api/auth/register",
        },
      },
      schemas: {
        // ── Auth ──────────────────────────────────────────────────────────
        RegisterInput: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: { type: "string", example: "Kenneth" },
            email: { type: "string", format: "email", example: "kenneth@example.com" },
            password: { type: "string", minLength: 6, example: "secret123" },
          },
        },
        LoginInput: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email", example: "kenneth@example.com" },
            password: { type: "string", example: "secret123" },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            status: { type: "string", example: "success" },
            message: { type: "string", example: "Logged in successfully." },
            token: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
            data: {
              type: "object",
              properties: {
                user: { $ref: "#/components/schemas/User" },
              },
            },
          },
        },
        User: {
          type: "object",
          properties: {
            id: { type: "string", example: "664f1b2c8a1e4b001c8d1234" },
            name: { type: "string", example: "Kenneth" },
            email: { type: "string", example: "kenneth@example.com" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        // ── Notes ─────────────────────────────────────────────────────────
        NoteInput: {
          type: "object",
          required: ["title", "content"],
          properties: {
            title: { type: "string", maxLength: 100, example: "Meeting notes" },
            content: { type: "string", maxLength: 10000, example: "Discussed Q3 roadmap..." },
            tags: {
              type: "array",
              items: { type: "string" },
              maxItems: 10,
              example: ["work", "meetings"],
            },
            isPinned: { type: "boolean", default: false, example: false },
          },
        },
        NoteUpdateInput: {
          type: "object",
          properties: {
            title: { type: "string", maxLength: 100, example: "Updated title" },
            content: { type: "string", maxLength: 10000, example: "Updated content..." },
            tags: { type: "array", items: { type: "string" }, example: ["updated"] },
            isPinned: { type: "boolean", example: true },
          },
        },
        Note: {
          type: "object",
          properties: {
            _id: { type: "string", example: "664f1b2c8a1e4b001c8d5678" },
            user: { type: "string", example: "664f1b2c8a1e4b001c8d1234" },
            title: { type: "string", example: "Meeting notes" },
            content: { type: "string", example: "Discussed Q3 roadmap..." },
            tags: { type: "array", items: { type: "string" }, example: ["work"] },
            isPinned: { type: "boolean", example: false },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        // ── Generic ───────────────────────────────────────────────────────
        ErrorResponse: {
          type: "object",
          properties: {
            status: { type: "string", example: "error" },
            message: { type: "string", example: "Something went wrong." },
            errors: {
              type: "array",
              items: { type: "string" },
              example: ["Title is required.", "Content cannot be empty."],
            },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.js"], // JSDoc comments are read from route files
};

module.exports = swaggerJsdoc(options);