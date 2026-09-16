/**
 * [DISCONNECTED]
 * MongoDB connection has been disconnected.
 * All database operations (CRUD & Auth) are now handled directly by the JazAcademy API.
 * See: src/lib/api-client.ts
 */

export async function connectToDatabase() {
  console.warn("MongoDB is disconnected. Operations should use JazAcademy API (src/lib/api-client.ts)");
  return null;
}

export default connectToDatabase;
