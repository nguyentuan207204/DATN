import request from "supertest";
import app from "./app.js";

async function testNews() {
    try {
        console.log("--- Testing GET /api/news ---");
        const res = await request(app).get("/api/news");
        console.log("Status:", res.status);
        console.log("Success:", res.body.success);
        console.log("Count:", res.body.data ? res.body.data.length : 0);
        if (res.body.data && res.body.data.length > 0) {
            console.log("First item title:", res.body.data[0].title);
        }

        if (res.body.data && res.body.data.length > 0) {
            const id = res.body.data[0].id;
            console.log(`\n--- Testing GET /api/news/${id} ---`);
            const resOne = await request(app).get(`/api/news/${id}`);
            console.log("Status:", resOne.status);
            console.log("Data title:", resOne.body.data.title);
        }

        process.exit(0);
    } catch (error) {
        console.error("Test failed:", error);
        process.exit(1);
    }
}

testNews();
