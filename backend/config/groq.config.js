import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey || apiKey === "your_groq_api_key_here") {
  console.warn(
    " Warning: GROQ_API_KEY is not set or using placeholder in .env file. Please set your valid Groq API key."
  );
}

const groq = new Groq({
  apiKey: apiKey || "dummy_key",
});

export default groq;
