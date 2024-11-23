# Architect Environment Variables

## Notes

- Items in the **Current List** without a 'value' are sensitive should not be saved to the git repository
- Choose `Y` when the first time you run and it asks: `Would you like to create a local preferences file? [Y|n]`

## Development

- `arc env -e testing --add NAME value`

### Current List

````
 
arc env -e testing --add ARC_SESSION_TABLE_NAME sessions
arc env -e testing --add ARC_APP_SECRET <use: "openssl rand -base64 32" to generate a strong secret>

````

## Staging

- `arc env -e staging --add NAME value`

### Current List

````

arc env -e staging --add ARC_SESSION_TABLE_NAME sessions 
arc env -e staging --add ARC_APP_SECRET <use: "openssl rand -base64 32" to generate a strong secret>

````

## Production

- `arc env -e production --add NAME value`

### Current List

````

arc env -e production --add ARC_SESSION_TABLE_NAME sessions
arc env -e production --add ARC_APP_SECRET <use: "openssl rand -base64 32" to generate a strong secret>

````