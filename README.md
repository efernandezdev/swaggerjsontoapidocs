# swaggerjsontoapidocs CLI

A Command Line Interface (CLI) tool that generates API documentation from a Swagger/OpenAPI JSON file. It is developed in TypeScript and uses Node.js. For every endpoint it generates a ready-to-use URL builder function with JSDoc documentation, so all your endpoints are centralized in one place.

## Features

- Reads Swagger/OpenAPI documents from a **remote URL** (`http://` / `https://`).
- Generates one file per resource, containing one URL builder function per endpoint (HTTP methods on the same path are grouped into a single function).
- Each function includes **JSDoc documentation** with HTTP verbs, summaries, the original endpoint and its path parameters.
- Removes the base path from endpoints automatically (e.g., `/api/v1/`).
- Configurable output: custom destination folder, flat file structure, and `.ts` or `.js` extensions.
- Optional `--fnl` flag to force all function names to lowercase for consistency.
- Optional `--api-model` flag that enriches the JSDoc with model references (**Query Parameter**, **Request Body**, **Response**), designed to work together with its companion CLI [swaggerjsontoapimodel](https://www.npmjs.com/package/swaggerjsontoapimodel).

## Installation

Install locally:

```bash
npm install swaggerjsontoapidocs
```

Or install globally to use it anywhere:

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

### Options

| Option                             | Description                                                                              | Default      |
| ---------------------------------- | ---------------------------------------------------------------------------------------- | ------------ |
| `-s, --swagger <url>`              | URL of the Swagger/OpenAPI JSON (e.g., `http://localhost:5033/swagger/v1/swagger.json`). | _(required)_ |
| `--bp <path>`                      | Base path to remove from endpoints (e.g., `/api/v1/`).                                   | _(required)_ |
| `-o, --output <path>`              | Destination folder for the generated files. Files are written inside `<path>/api_docs/`. |              |
| `--skip-folder`                    | Generate flat files instead of nested folders.                                           | `false`      |
| `--fnl, --function-name-lowercase` | Force all function names to lowercase for consistency.                                   | `false`      |
| `-e, --ext <.ts\|.js>`             | Extension of the generated files.                                                        | `.ts`        |
| `--api-model`                      | Enrich the JSDoc with model references (requires `.ts`). Use with swaggerjsontoapimodel. | `false`      |

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

### Result --fnl (function name lowercase)

```typescript
// products.ts
export const products_productid_reviews_reviewid_comments_commentid = (
  productId: any,
  reviewId: any,
  commentId: any,
) => `Products/${productId}/Reviews/${reviewId}/Comments/${commentId}`;
```

## Advanced Usage

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

## Companion Tool: swaggerjsontoapimodel

This CLI pairs naturally with [swaggerjsontoapimodel](https://www.npmjs.com/package/swaggerjsontoapimodel), a CLI that generates TypeScript models (schema interfaces and query parameter types) from the same Swagger/OpenAPI document.

When you run this tool with `--api-model` (and the default `.ts` extension), each JSDoc block is enriched with references to those generated models. The references are resolved from OpenAPI 3 documents: `in: query` parameters, `requestBody` schemas and response `$ref` schemas:

```bash
npx swaggerjsontoapidocs -s http://localhost:5033/swagger/v1/swagger.json --bp /api/v1/ --api-model
```

For example, given a `GET` + `POST` on `/api/v1/users/{userId}/orders` (with query parameters and an `Order` schema referenced by the request body and responses):

### Result --api-model

```typescript
// users.ts
/**
 * ##### METHODS
 * **GET**: List orders for a user
 *
 * **Query Parameter**: GetUsersOrders
 *
 * **Response**: Order[]
 *
 * **POST**: Create an order for a user
 *
 * **Request Body**: Order
 *
 * **Response**: Order
 *
 * ---
 * **Endpoint**: `/api/v1/users/{userId}/orders`
 *
 * ---
 * ##### PATH PARAMETERS
 * @param userId - any
 */
export const users_userId_orders = (userId: any) => `users/${userId}/orders`;
```

- **Query Parameter**: name of the query params interface generated by swaggerjsontoapimodel for that method.
- **Request Body**: model referenced by the OpenAPI 3 request body.
- **Response**: model referenced by the response (`[]` is appended when it resolves to an array).

Run both CLIs against the same document: swaggerjsontoapimodel generates `GetUsersOrders`, `Order`, etc., and this tool documents exactly where those models apply, so you get typed models plus documented endpoint functions working together out of the box.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.
