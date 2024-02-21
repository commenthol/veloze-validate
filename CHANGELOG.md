# 0.8.0 (2024-02-21)

### feat:

- clone schema (#b4aeab2)

### fix:

- console.log in code; bound ipv6 regex (#e22858b)
- linter no-console warn (#aa13969)

### docs:

- update description and examples (#2bb0d9b)

# 0.7.0 (2024-02-20)

### BREAKING CHANGE:

- string formats separated from validate.js to allow smaller core
- ipv4, ipv6, date, time string format (#5d84d83)

### fix:

- linter issue (#d3e142c)

# 0.6.0 (2024-02-19)

### feat:

- email and hostname validation (#1c0a1f3)

# 0.5.0 (2024-02-18)

### feat:

- default values on undefined. Apply on cast() (#6a69da4)
- analyze() returns ValidationError (#7f77337)
- allOf schema validation (#d29222b)

### fix:

- types (#0a45b0d)

### docs:

- fix examples (#35748c3)

### chore:

- bump devdependencies (#a9b0ebd)

# 0.4.0 (2023-10-13)

### BREAKING CHANGE:

- change functions to classes (#d138356)

# 0.3.0 (2023-10-08)

### feat:

- cast values from schema (#2388d1b)

### fix:

- ignore date type in toJsonSchema (#1f2f612)

### docs:

- fix anyOf documentation (#ae8cdce)

# 0.2.0 (2023-10-05)

### feat:

- cast boolean and numeric values from string types (#c168687)

### docs:

- fix badge (#d3b2bc9)

### chore:

- github actions (#00f503b)

# 0.1.0 (2023-10-01)

### feat:

- conversion to JSON schema (#c8c743a)
- add dateT validation (#75d658f)
- validation for primitives, objects and array (#9f7dbc5)

### fix:

- no need for allOf (#cb1361e)

### other:

- initial commit (#f928658)

### test:

- increase coverage with objectT RangeError test (#de018d8)

