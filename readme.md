cd my-pharma-app>>npm install>>npm run dev
cd pharma_backend>>npm install>>npm start
recheck .env >>
PORT=3000
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pharmacy_app
<<
run database server
Run npm run start:all to launch both projects together
with this script in common/package.json
"scripts": {
  "start:frontend": "cd my-pharma-app && npm run dev",
  "start:backend": "cd pharma_backend && npm start",
  "start:all": "npm-run-all --parallel start:backend start:frontend"
}