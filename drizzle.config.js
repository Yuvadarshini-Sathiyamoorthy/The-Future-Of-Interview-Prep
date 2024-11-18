/** @type { import("drizzle-kit").Config } */
export default {
    schema: "./utils/schema.js",
    dialect: 'postgresql',
    dbCredentials: {
      url: 'postgresql://neondb_owner:NuC9yErbL4jk@ep-purple-morning-a5nomkoq.us-east-2.aws.neon.tech/ai-interview-mocker?sslmode=require',
    }
  };