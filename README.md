# swaggerjsontoapidocs CLI

This project is a Command Line Interface (CLI) tool that generates API documentation from a Swagger JSON file. It is developed in TypeScript and uses Node.js.

## Installation

Make sure you have Node.js installed on your system. Then, install the project dependencies by running:

```bash
npm install swaggerjsontoapidocs
```

```bash
npm install swaggerjsontoapidocs -g
```

## Usage

The CLI script is executed using the following command:

```bash
npx swaggerjsontoapidocs [options]
```

---

**⚠️ Windows / Git Bash Tip:⚠️**

Git Bash automatically converts root paths (like /api) to Windows paths (like C:\...). To prevent this error, use the MSYS_NO_PATHCONV flag:

```bash
MSYS_NO_PATHCONV=1 npx swaggerjsontoapidocs [options]
```

---

### Available Arguments

- `-s, --swagger <url>` : URL of the Swagger/OpenAPI JSON (required).
- `--bp <path>` : Base path to remove from endpoints (e.g. `/api/`) (required).
- `-o, --output <path>` : Destination folder for generated files (optional).
- `--skip-folder` : Generate flat files (no nested folders).
- `--fnl` : Force function names to lowercase.
- `-e, --ext <.ts|.js>` : Output file extension for generated files. Allowed values: `.ts` (default) or `.js`.

### Example Usage

```bash
npx swaggerjsontoapidocs -s http://localhost:5033/swagger/v1/swagger.json --bp /api/v1/
```

In this example:

- `-s` points to the URL of the Swagger JSON file.
- `--bp` defines the base path `/api/v1/` to be removed from the endpoints.

<details>
  <summary>Swagger.json (Click to expand)</summary>

```json
{
  "swagger": "2.0",
  "info": {
    "version": "1.2.0",
    "title": "Extended Sample API with Multiple Path Parameters",
    "description": "Test Swagger specification including endpoints with multiple path parameters."
  },
  "paths": {
    "/api/v1/users/{userId}/orders/{orderId}": {
      "get": {
        "tags": ["Order Processing"],
        "summary": "Get a specific order for a user",
        "parameters": [
          {
            "name": "userId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "orderId",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responses": {
          "200": { "description": "Order details" },
          "404": { "description": "Order not found" }
        }
      },
      "put": {
        "tags": ["Order Processing"],
        "summary": "Update a specific order for a user",
        "parameters": [
          {
            "name": "userId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "orderId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "body",
            "in": "body",
            "required": true,
            "schema": { "$ref": "#/definitions/Order" }
          }
        ],
        "responses": { "200": { "description": "Order updated" } }
      }
    },
    "/api/v1/Products/{productId}/Reviews/{reviewId}/Comments/{commentId}": {
      "delete": {
        "tags": ["Reviews"],
        "summary": "Delete a specific comment on a review",
        "parameters": [
          {
            "name": "productId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "reviewId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "commentId",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responses": {
          "200": { "description": "Comment deleted" },
          "404": { "description": "Comment not found" }
        }
      }
    },
    "/api/v1/admin/{section}/{entityId}/actions/{actionId}": {
      "post": {
        "tags": ["Administration"],
        "summary": "Perform an admin action on an entity",
        "parameters": [
          {
            "name": "section",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "entityId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "actionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "body",
            "in": "body",
            "required": false,
            "schema": {
              "type": "object",
              "properties": {
                "reason": { "type": "string" },
                "timestamp": { "type": "string", "format": "date-time" }
              }
            }
          }
        ],
        "responses": {
          "200": { "description": "Action executed successfully" },
          "400": { "description": "Invalid action" }
        }
      }
    }
  },
  "definitions": {
    "Order": {
      "type": "object",
      "properties": {
        "id": { "type": "string" },
        "status": { "type": "string" },
        "items": {
          "type": "array",
          "items": { "type": "string" }
        }
      }
    }
  }
}
```

</details>

### Result

```bash
api_docs/
├── admin
│   └── admin.ts
├── products
│   └── products.ts
└── users
    └── users.ts
```

```typescript
// products.ts
/**
 * ##### METHODS
 * **DELETE**: Delete a specific comment on a review
 *
 * ---
 * **Endpoint**: `/api/v1/Products/{productId}/Reviews/{reviewId}/Comments/{commentId}`
 *
 * ---
 * ##### PATH PARAMETERS
 * @param productId - any
 * @param reviewId - any
 * @param commentId - any
 */
export const Products_productId_Reviews_reviewId_Comments_commentId = (
  productId: any,
  reviewId: any,
  commentId: any,
) => `Products/${productId}/Reviews/${reviewId}/Comments/${commentId}`;
```

### Result --function-name-lowercase

```typescript
// products.ts
export const products_productId_reviews_reviewId_comments_commentId = (
  productId: any,
  reviewId: any,
  commentId: any,
) => `Products/${productId}/Reviews/${reviewId}/Comments/${commentId}`;
```

### Advanced Usage

```bash
npx swaggerjsontoapidocs -s http://localhost:5033/swagger/v1/swagger.json --bp /api/v1/ -o ./docs/ --skip-folder
```

In this example:

- `-o` specifies `./docs/` as the destination folder (resulting in `./docs/api_docs`).
- `--skip-folder` generates flat files (no nested folders).

### Result --skip-folder

```bash
docs/
└── api_docs
    ├── admin.ts
    ├── products.ts
    └── users.ts
```

## License

This project is licensed under the MIT License. See the LICENSE file for more details.
