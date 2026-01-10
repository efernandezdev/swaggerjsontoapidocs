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

### Available Arguments

- `-s, --swagger <url>`: Specifies the URL of the Swagger JSON file.
- `-bp, --basePath <path>`: Defines the base path where the API documentation will be generated.

### Example Usage

```bash
npx swaggerjsontoapidocs -s http://localhost:5033/swagger/v1/swagger.json --bp /api/
```

In this example:

- `-s` points to the URL of the Swagger JSON file.
- `-bp` defines the base path `/api/` where the documentation will be generated.

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

```typescript
// Users.ts
export const Users = () => `Users`;
/**
 * @param id
 */
export const Users_id = (id: any) => `Users/${id}`;
```

## License

This project is licensed under the MIT License. See the LICENSE file for more details.
