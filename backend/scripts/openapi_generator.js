import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { swaggerSpec } from "../swagger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputPath = path.resolve(__dirname, "../../docs/openapi.json");
const outputDir = path.dirname(outputPath);

// Đảm bảo thư mục docs tồn tại
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

try {
  fs.writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2), "utf-8");
  console.log(`✅ Success: OpenAPI spec generated at ${outputPath}`);
} catch (error) {
  console.error(`❌ Error generating OpenAPI spec: ${error.message}`);
  process.exit(1);
}
