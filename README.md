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

- `-s, --swagger <url>`: Specifies the URL of the Swagger JSON file.
- `--bp <path>`: Base path to remove from endpoints (e.g., `/api/`).
- `-o, --output <path>`: Path to the output folder destination.
- `--skip-folder`: Generates flat files instead of nested folders.
- `--fnl, --function-name-lowercase`: Force all function names to lowercase for consistency.

### Example Usage

```bash
npx swaggerjsontoapidocs -s http://localhost:5033/swagger/v1/swagger.json --bp /api/
```

In this example:

- `-s` points to the URL of the Swagger JSON file.
- `--bp` defines the base path `/api/` to be removed from the endpoints.

<details>
  <summary>Swagger.json (Click to expand)</summary>

```json
{
  "openapi": "3.0.1",
  "info": {
    "title": "fakeApi",
    "version": "1.0"
  },
  "paths": {
    "/api/Users": {
      "get": {
        "tags": ["Users"],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "text/plain": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/Usuario"
                  }
                }
              },
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/Usuario"
                  }
                }
              },
              "text/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/Usuario"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/Users/{id}": {
      "get": {
        "tags": ["Users"],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "text/plain": {
                "schema": {
                  "$ref": "#/components/schemas/Usuario"
                }
              },
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Usuario"
                }
              },
              "text/json": {
                "schema": {
                  "$ref": "#/components/schemas/Usuario"
                }
              }
            }
          }
        }
      },
      "post": {
        "tags": ["Users"],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "text/plain": {
                "schema": {
                  "$ref": "#/components/schemas/Usuario"
                }
              },
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Usuario"
                }
              },
              "text/json": {
                "schema": {
                  "$ref": "#/components/schemas/Usuario"
                }
              }
            }
          }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "Usuario": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "nullable": true
          },
          "nombre": {
            "type": "string",
            "nullable": true
          },
          "email": {
            "type": "string",
            "nullable": true
          }
        },
        "additionalProperties": false
      }
    }
  }
}
```

</details>

### Result

```bash
├── api_docs
│   ├── products
│       └── products.ts
```

```typescript
// products.ts
/**
 * @endpoint /api/products
 * @methods GET - POST
 */
export const products = () => `products`;
/**
 * @endpoint /api/products/{id}/category/{categoryId}
 * @methods GET - PUT - DELETE
 * @param id
 * @param categoryId
 */
export const products_id_category_categoryId = (id: any, categoryId: any) =>
  `products/${id}/category/${categoryId}`;
```

### Result --function-name-lowercase

```typescript
// products.ts
/**
 * @endpoint /api/products/{id}/category/{categoryId}
 * @methods GET - PUT - DELETE
 * @param id
 * @param categoryId
 */
export const products_id_category_categoryid = (id: any, categoryId: any) =>
  `products/${id}/category/${categoryId}`;
```

### Advanced Usage

```bash
npx swaggerjsontoapidocs -s http://localhost:5033/swagger/v1/swagger.json --bp /api/ -o ./docs/ --skip-folder
```

In this example:

- `-o` specifies `./docs/` as the destination folder (resulting in `./docs/api_docs`).
- `--skip-folder` generates flat files (no nested folders).

### Result --skip-folder

```bash
docs
└── api_docs
    ├── products.ts
    └── weatherforecast.ts
```

## License

This project is licensed under the MIT License. See the LICENSE file for more details.
