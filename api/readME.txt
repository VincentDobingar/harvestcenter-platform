mkdir harvestcenter
mkdir backend
cd backend
npm init -y

// 2. Installer les dépendances
npm install express mysql2 dotenv jsonwebtoken bcrypt cors multer
npm install nodemon --save-dev

// 3. Structure du projet

backend/
 ├─ src/
 │  ├─ config/
 │  │   └─ db.js
 │  ├─ middlewares/
 │  │   ├─ auth.js
 │  │   └─ role.js
 │  ├─ routes/
 │  │   ├─ auth.routes.js
 │  │   ├─ student.routes.js
 │  │   ├─ admin.routes.js
 │  ├─ controllers/
 │  │   ├─ auth.controller.js
 │  │   ├─ student.controller.js
 │  │   └─ admin.controller.js
 │  ├─ app.js
 │  └─ server.js
 ├─ .env
 └─ package.json
