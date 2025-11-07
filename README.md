# Welcome to global-medicine-backend 👋

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg?cacheSeconds=2592000)
![Node](https://img.shields.io/badge/node-v20.19.0-green.svg)
![Express](https://img.shields.io/badge/express-4.x-blue.svg)
![GraphQL](https://img.shields.io/badge/GraphQL-E10098?logo=graphql&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?logo=jsonwebtokens&logoColor=white)

> Backend completo para sistema de gestión de cursos con Node.js, Express, MongoDB, GraphQL y autenticación JWT.

## 📋 Descripción

Sistema backend robusto y escalable para la gestión de cursos de medicina, implementando una arquitectura moderna con GraphQL para consultas eficientes y JWT para autenticación segura. La aplicación utiliza MongoDB Atlas como base de datos en la nube, garantizando alta disponibilidad y rendimiento.

## 🚀 Tecnologías Utilizadas

Este proyecto está construido con las siguientes tecnologías:

### Core Technologies
- **Node.js v20.19.0** - Entorno de ejecución de JavaScript del lado del servidor
- **Express.js** - Framework web minimalista y flexible para Node.js
- **GraphQL** - Lenguaje de consulta para APIs que proporciona una descripción completa de los datos

### Base de Datos
- **MongoDB Atlas** - Plataforma de base de datos en la nube completamente administrada
  - Clusters administrados con alta disponibilidad
  - Backups automáticos
  - Escalabilidad horizontal
  - Monitoreo en tiempo real

### Autenticación y Seguridad
- **JWT (JSON Web Tokens)** - Estándar abierto para la transmisión segura de información entre partes
  - Autenticación stateless
  - Tokens seguros y verificables
  - Control de acceso basado en roles

## 📦 Instalación

```sh
npm install
```

## 🗄️ Configuración de Base de Datos

### Poblar base de datos con datos iniciales

```sh
node seed.js
```

Este comando inicializa la base de datos MongoDB Atlas con datos de prueba necesarios para el funcionamiento del sistema.

## 🏃 Ejecución

### Modo Desarrollo

```sh
npm run dev
```

El servidor se iniciará en modo desarrollo con hot-reload activado.

### Modo Producción

```sh
npm run start
```

## 🧪 Testing

### Ejecutar pruebas con cobertura

```sh
npm run test:coverage
```

Este comando ejecutará todas las pruebas unitarias e integrales y generará un reporte de cobertura de código.

## 📁 Estructura del Proyecto

```
global-medicine-backend/
├── src/
│   ├── models/          # Modelos de MongoDB
│   ├── schema/          # Esquemas de GraphQL
│   ├── resolvers/       # Resolvers de GraphQL
│   ├── middleware/      # Middleware de Express (JWT, etc.)
│   ├── config/          # Configuración (DB, ENV)
│   └── utils/           # Utilidades y helpers
├── tests/               # Tests unitarios e integración
├── seed.js              # Script para poblar la BD
└── server.js            # Punto de entrada de la aplicación
```

## 🔐 Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
PORT=3001
MONGODB_URI=tu_conexion_mongodb_atlas
JWT_SECRET=tu_secreto_jwt
JWT_EXPIRE=7d
NODE_ENV=development
```

## 🌐 API GraphQL

### Endpoint Principal

```
http://localhost:3001/graphql
```

### Ejemplos de Queries y Mutations

#### Query: Obtener todos los cursos
```graphql
query {
  courses {
    id
    title
    description
    instructor
    duration
  }
}
```

#### Mutation: Crear un nuevo curso
```graphql
mutation {
  createCourse(input: {
    title: "Curso de Cardiología"
    description: "Curso completo de cardiología clínica"
    instructor: "Dr. Juan Pérez"
    duration: 40
  }) {
    id
    title
  }
}
```

## 🔒 Autenticación

El sistema utiliza JWT para la autenticación. Para acceder a rutas protegidas:

1. Realiza login y obtén tu token
2. Incluye el token en el header de tus peticiones:
```
Authorization: Bearer <tu_token_jwt>
```

## 🛠️ Características Principales

- ✅ API GraphQL completa con queries y mutations
- ✅ Autenticación y autorización con JWT
- ✅ Conexión segura a MongoDB Atlas
- ✅ Validación de datos con middleware
- ✅ Manejo de errores centralizado
- ✅ Tests con cobertura de código
- ✅ Documentación de API
- ✅ Variables de entorno para configuración
- ✅ Arquitectura escalable y mantenible

## 📊 MongoDB Atlas - Características

- **Clusters Globales**: Distribución de datos en múltiples regiones
- **Backup Automático**: Copias de seguridad continuas
- **Monitoreo**: Dashboard con métricas en tiempo real
- **Seguridad**: Encriptación en reposo y en tránsito
- **Escalabilidad**: Ajuste automático según demanda

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 👤 Autor

**neodevone**

* Website: https://portfolio.alyneos.com/
* Github: [@neodevone](https://github.com/neodevone)

## 📝 Licencia

Este proyecto está bajo la licencia ISC.

## ⭐ Show your support

Give a ⭐️ if this project helped you!



