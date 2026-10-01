# swaggerjsontoapidocs CLI

A Command Line Interface (CLI) tool that generates API documentation from a Swagger/OpenAPI JSON file. It is developed in TypeScript and uses Node.js. For every endpoint it generates a ready-to-use URL builder function with JSDoc documentation, so all your endpoints are centralized in one place.

## Features

- Reads Swagger/OpenAPI documents from a **remote URL** (`http://` / `https://`).
- Generates one file per resource, containing one URL builder function per endpoint (HTTP methods on the same path are grouped into a single function).
- Each function includes **JSDoc documentation** with HTTP verbs, summaries, the original endpoint and its path parameters.
- Only real HTTP verbs are documented: path level keys such as `parameters`, `servers` or `$ref` are ignored.
- Operations flagged as `deprecated` in the spec are documented with `@deprecated`.
- Removes the base path from endpoints automatically (e.g., `/api/v1/`).
- Configurable output: custom destination folder, flat file structure, and `.ts` or `.js` extensions.
- Optional `--fnl` flag to force all function names to lowercase for consistency.
- Optional `--api-model` flag that enriches the JSDoc with model references (**Query Parameter**, **Request Body**, **Response**), designed to work together with its companion CLI [swaggerjsontoapimodel](https://www.npmjs.com/package/swaggerjsontoapimodel).
- Optional `--open-api` flag that documents **Request Body** and **Response** (one entry per status code, resolved to a TypeScript type) for projects generated with [openapi-generator](https://openapi-generator.tech/). Requires `.ts`, since the entries point to TypeScript models.

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

| Option                             | Description                                                                                                                             | Default      |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| `-s, --swagger <url>`              | URL of the Swagger/OpenAPI JSON (e.g., `http://localhost:5033/swagger/v1/swagger.json`).                                                | _(required)_ |
| `--bp <path>`                      | Base path to remove from endpoints (e.g., `/api/v1/`).                                                                                  | _(required)_ |
| `-o, --output <path>`              | Destination folder for the generated files. Files are written inside `<path>/api_docs/`.                                                |              |
| `--skip-folder`                    | Generate flat files instead of nested folders.                                                                                          | `false`      |
| `--fnl, --function-name-lowercase` | Force all function names to lowercase for consistency.                                                                                  | `false`      |
| `-e, --ext <.ts\|.js>`             | Extension of the generated files.                                                                                                       | `.ts`        |
| `--api-model`                      | Enrich the JSDoc with **Query Parameter**, **Request Body** and **Response** (requires `.ts`). Use with swaggerjsontoapimodel.          | `false`      |
| `--open-api`                       | Enrich the JSDoc with **Request Body** and **Response** (requires `.ts` and OpenAPI 3). Alias: `--openApi`. Use with openapi-generator. | `false`      |

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
    "/api/v1/users/{userId}/orders": {
      "parameters": [
        {
          "name": "userId",
          "in": "path",
          "required": true,
          "type": "string"
        }
      ],
      "get": {
        "tags": ["Order Processing"],
        "summary": "List orders for a user",
        "parameters": [
          {
            "name": "status",
            "in": "query",
            "type": "string"
          },
          {
            "name": "pageSize",
            "in": "query",
            "type": "integer"
          }
        ],
        "responses": {
          "200": {
            "description": "Order list",
            "schema": {
              "type": "array",
              "items": {
                "$ref": "#/definitions/Order"
              }
            }
          },
          "204": {
            "description": "The user has no orders"
          },
          "400": {
            "description": "Invalid request",
            "schema": {
              "$ref": "#/definitions/ErrorResponse"
            }
          }
        }
      },
      "post": {
        "tags": ["Order Processing"],
        "summary": "Create an order for a user",
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "required": true,
            "schema": {
              "$ref": "#/definitions/Order"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Order created",
            "schema": {
              "$ref": "#/definitions/Order"
            }
          },
          "400": {
            "description": "Invalid request",
            "schema": {
              "$ref": "#/definitions/ErrorResponse"
            }
          }
        }
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
          "200": {
            "description": "Comment deleted"
          },
          "404": {
            "description": "Comment not found"
          }
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
                "reason": {
                  "type": "string"
                },
                "timestamp": {
                  "type": "string",
                  "format": "date-time"
                }
              }
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Action executed successfully"
          },
          "400": {
            "description": "Invalid action"
          }
        }
      }
    }
  },
  "definitions": {
    "Order": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string"
        },
        "status": {
          "type": "string"
        },
        "items": {
          "type": "array",
          "items": {
            "type": "string"
          }
        }
      }
    },
    "ErrorResponse": {
      "type": "object",
      "properties": {
        "code": {
          "type": "integer"
        },
        "message": {
          "type": "string"
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

## Companion Tool: swaggerjsontoapimodel or openapi-generator

This CLI pairs naturally with [swaggerjsontoapimodel](https://www.npmjs.com/package/swaggerjsontoapimodel), a CLI that generates TypeScript models (schema interfaces and query parameter types) from the same OpenAPI document.

Both flags require the default `.ts` extension, because the names they write in the JSDoc are TypeScript interfaces:

- `--open-api`: for projects generated with [openapi-generator](https://openapi-generator.tech/), it writes the **Request Body** and **Response** interface names of every method, so you can locate them fast inside the generated models.
- `--api-model`: for projects generated with swaggerjsontoapimodel, it writes the same **Request Body** and **Response** names, plus the **Query Parameter** interface of each method, which only swaggerjsontoapimodel generates.

```bash
# for openapi-generator projects
npx swaggerjsontoapidocs -s http://localhost:5033/swagger/v1/example.json --bp /api/v1/ -o ./docs/ --skip-folder --open-api

# for swaggerjsontoapimodel projects
npx swaggerjsontoapidocs -s http://localhost:5033/swagger/v1/example.json --bp /api/v1/ -o ./docs/ --skip-folder --api-model
```

<details>
  <summary>example.json (OpenAPI 3.0 - Click to expand)</summary>

```json
{
  "openapi": "3.0.3",
  "info": {
    "version": "1.2.0",
    "title": "Extended Sample API with Multiple Path Parameters",
    "description": "OpenAPI sample including endpoints with multiple path parameters, deprecated operations and reusable responses."
  },
  "servers": [
    {
      "url": "http://localhost:8000/api/v1"
    }
  ],
  "paths": {
    "/api/v1/users/{userId}/orders": {
      "parameters": [
        {
          "name": "userId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string"
          }
        }
      ],
      "get": {
        "tags": ["Order Processing"],
        "summary": "List orders for a user",
        "parameters": [
          {
            "name": "status",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "pageSize",
            "in": "query",
            "schema": {
              "type": "integer"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Order list",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/Order"
                  }
                }
              },
              "text/plain": {
                "schema": {
                  "type": "string"
                }
              }
            }
          },
          "204": {
            "description": "The user has no orders"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          }
        }
      },
      "post": {
        "tags": ["Order Processing"],
        "summary": "Create an order for a user",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/Order"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Order created",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Order"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          }
        }
      },
      "delete": {
        "tags": ["Order Processing"],
        "summary": "Delete all the orders of a user",
        "deprecated": true,
        "responses": {
          "204": {
            "description": "Orders deleted"
          }
        }
      }
    },
    "/api/v1/Products/{productId}/Reviews/{reviewId}/Comments/{commentId}": {
      "parameters": [
        {
          "name": "productId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string"
          }
        },
        {
          "name": "reviewId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string"
          }
        },
        {
          "name": "commentId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string"
          }
        }
      ],
      "delete": {
        "tags": ["Reviews"],
        "summary": "Delete a specific comment on a review",
        "responses": {
          "200": {
            "description": "Removed comment ids",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/Comment"
                  }
                }
              }
            }
          },
          "204": {
            "description": "Comment deleted"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          }
        }
      }
    },
    "/api/v1/admin/{section}/{entityId}/actions/{actionId}": {
      "post": {
        "tags": ["Administration"],
        "summary": "Perform an admin action on an entity",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "reason": {
                    "type": "string"
                  },
                  "timestamp": {
                    "type": "string",
                    "format": "date-time"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Action executed successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "string"
                }
              },
              "text/plain": {
                "schema": {
                  "type": "string"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          }
        }
      }
    }
  },
  "components": {
    "responses": {
      "BadRequest": {
        "description": "Invalid request",
        "content": {
          "application/json": {
            "schema": {
              "$ref": "#/components/schemas/ErrorResponse"
            }
          }
        }
      },
      "NotFound": {
        "description": "Resource not found",
        "content": {
          "application/json": {
            "schema": {
              "$ref": "#/components/schemas/ErrorResponse"
            }
          }
        }
      }
    },
    "schemas": {
      "Order": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "status": {
            "type": "string"
          },
          "items": {
            "type": "array",
            "items": {
              "type": "string"
            }
          }
        }
      },
      "Comment": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "body": {
            "type": "string"
          }
        }
      },
      "ErrorResponse": {
        "type": "object",
        "properties": {
          "code": {
            "type": "integer"
          },
          "message": {
            "type": "string"
          }
        }
      }
    }
  }
}
```

</details>

### Result --api-model --open-api

Both flags can be combined, and the result below was generated with the two of them enabled:

```bash
docs/
└── api_docs
    ├── admin.ts
    ├── products.ts
    └── users.ts
```

```typescript
// users.ts
/**
 * ##### METHODS
 * **GET**: List orders for a user
 *
 * - **Query Parameter**:
 *
 * 		 GetUsersOrders
 *
 * - **Response**:
 *
 * 		 200: Order[]
 * 		 400: ErrorResponse
 *
 * **POST**: Create an order for a user
 *
 * - **Request Body**:
 *
 * 		 Order
 *
 * - **Response**:
 *
 * 		 200: Order
 * 		 400: ErrorResponse
 *
 * @deprecated
 *
 * **DELETE**: Delete all the orders of a user
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

```typescript
// products.ts
/**
 * ##### METHODS
 * **DELETE**: Delete a specific comment on a review
 *
 * - **Response**:
 *
 * 		 200: Comment[]
 * 		 404: ErrorResponse
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

```typescript
// admin.ts
/**
 * ##### METHODS
 * **POST**: Perform an admin action on an entity
 *
 * - **Response**:
 *
 * 		 200: string
 * 		 400: ErrorResponse
 * 		 404: ErrorResponse
 *
 * ---
 * **Endpoint**: `/api/v1/admin/{section}/{entityId}/actions/{actionId}`
 *
 * ---
 * ##### PATH PARAMETERS
 * @param section - any
 * @param entityId - any
 * @param actionId - any
 */
export const admin_section_entityId_actions_actionId = (
  section: any,
  entityId: any,
  actionId: any,
) => `admin/${section}/${entityId}/actions/${actionId}`;
```

- **Query Parameter**: name of the query params interface generated by swaggerjsontoapimodel for that method. Only added with `--api-model`.
- **Request Body**: model referenced by the OpenAPI 3 request body. Only `$ref` schemas are documented, so inline bodies (like `admin.ts`) are skipped.
- **Response**: model referenced by each status code. One line per code, so every documented outcome of the endpoint is listed.
- **@deprecated**: added when the operation is flagged as `deprecated` in the spec.

### How the response type is resolved

| OpenAPI schema                         | Documented as |
| -------------------------------------- | ------------- |
| `$ref: '#/components/schemas/Order'`   | `Order`       |
| `type: array` + `items.$ref` → `Order` | `Order[]`     |
| `type: string`                         | `string`      |
| `type: integer` / `type: number`       | `number`      |
| `type: boolean`                        | `boolean`     |
| Schema with neither `type` nor `$ref`  | `unknown`     |

Keep in mind:

- Only `application/*` media types are documented. The `text/plain` responses in the example above are ignored, which is why `GET /users/{userId}/orders` only lists `200` and `400`.
- Responses without content (`204 No Content`) are not documented.
- Reusable responses are resolved through `components.responses`, which is how the `400` and `404` codes end up as `ErrorResponse`.
- One entry per status code: if several `application/*` media types share a code, only one is listed.

Run both CLIs against the same document: swaggerjsontoapimodel generates `GetUsersOrders`, `Order`, etc., and this tool documents exactly where those models apply, so you get typed models plus documented endpoint functions working together out of the box.

If your models come from openapi-generator instead, `--open-api` gives you the same **Request Body** / **Response** names, just without the **Query Parameter** entry, since that interface is specific to swaggerjsontoapimodel.

## OpenAPI 2.0 vs OpenAPI 3.x

| JSDoc entry                             | OpenAPI 2.0                                   | OpenAPI 3.x                                    |
| --------------------------------------- | --------------------------------------------- | ---------------------------------------------- |
| Verbs, summaries, endpoint, path params | ✅                                            | ✅                                             |
| `@deprecated`                           | ✅                                            | ✅                                             |
| **Query Parameter** (`--api-model`)     | ✅ (`in: query` parameters)                   | ✅ (`in: query` parameters)                    |
| **Request Body**                        | ❌ (bodies live in `parameters` + `in: body`) | ✅ (`requestBody.content`)                     |
| **Response** per status code            | ❌ (schemas live under the response)          | ✅ (`content` + `components.responses` `$ref`) |

Either version generates the same URL builder functions; only the model information in the JSDoc differs.

### Result --api-model (OpenAPI 2.0)

OpenAPI 2.0 has no `requestBody` and no `content` object, so only the **Query Parameter** is resolved, even with both flags enabled:

```typescript
// users.ts
/**
 * ##### METHODS
 * **GET**: List orders for a user
 *
 * - **Query Parameter**:
 *
 * 		 GetUsersOrders
 *
 * **POST**: Create an order for a user
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

## License

This project is licensed under the MIT License. See the LICENSE file for more details.

