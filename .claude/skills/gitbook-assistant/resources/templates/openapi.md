# OpenAPI Block Template

## Basic Syntax

```markdown
{% openapi src="url-to-openapi-spec" path="/api/endpoint" method="get" %}
url-to-openapi-spec
{% endopenapi %}
```

## With External OpenAPI Spec

```markdown
{% openapi src="https://api.example.com/openapi.json" path="/v1/users/{id}" method="get" %}
https://api.example.com/openapi.json
{% endopenapi %}
```

## Common HTTP Methods

### GET Request
```markdown
{% openapi src="./openapi.json" path="/getCompressedAccount" method="get" %}
./openapi.json
{% endopenapi %}
```

### POST Request
```markdown
{% openapi src="./openapi.json" path="/getValidityProof" method="post" %}
./openapi.json
{% endopenapi %}
```

### PUT Request
```markdown
{% openapi src="./openapi.json" path="/api/v1/resource/{id}" method="put" %}
./openapi.json
{% endopenapi %}
```

### DELETE Request
```markdown
{% openapi src="./openapi.json" path="/api/v1/resource/{id}" method="delete" %}
./openapi.json
{% endopenapi %}
```

## OpenAPI Extensions

### Custom Code Samples
```yaml
x-codeSamples:
  - lang: TypeScript
    source: |
      const account = await rpc.getCompressedAccount(hash);
  - lang: Rust
    source: |
      let account = rpc.get_compressed_account(&hash).await?;
```

### Custom Request Body Examples
```yaml
x-bodyName: "validityProofRequest"
```

### RPC Method Name
```yaml
x-rpc-method-name: "getCompressedAccount"
```

## Best Practices

- Store OpenAPI specs in a dedicated directory (e.g., `/api-specs/`)
- Use relative paths when spec is in the same repository
- Ensure OpenAPI spec is valid (use validators)
- Include comprehensive examples in the spec
- Use extensions for language-specific code samples
- Document all parameters, responses, and errors
- Version your API specs (e.g., `openapi-v1.json`, `openapi-v2.json`)

## ZK Compression RPC Example

```markdown
{% openapi src="../api-specs/zk-compression-rpc.json" path="/getCompressedAccount" method="post" %}
../api-specs/zk-compression-rpc.json
{% endopenapi %}
```

## Notes

- The URL between tags is required (mirrors the src parameter value for parsing)
- OpenAPI spec can be JSON or YAML format
- GitBook will render interactive API documentation
- Supports OpenAPI 2.0 (Swagger) and 3.0+ specifications
- Path parameters are shown with curly braces: `/users/{userId}`
