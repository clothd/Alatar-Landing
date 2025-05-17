import { NextResponse } from 'next/server';
import { MongoClient, ServerApiVersion } from 'mongodb';

// Connection string with explicit options
const uri = "mongodb+srv://dev:dev@cluster0.b9itiuo.mongodb.net/alatar-waitlist?retryWrites=true&w=majority&appName=Cluster0&serverSelectionTimeoutMS=5000";

// Create a MongoClient with explicit options
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  maxPoolSize: 1, // Reduce pool size for serverless
  minPoolSize: 0,
  maxIdleTimeMS: 10000,
  connectTimeoutMS: 5000,
  socketTimeoutMS: 5000,
  family: 4, // Force IPv4
});

// Retry mechanism
async function withRetry<T>(operation: () => Promise<T>, maxRetries: number = 3): Promise<T> {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt} of ${maxRetries}`);
      return await operation();
    } catch (error: any) {
      lastError = error;
      console.error(`Attempt ${attempt} failed:`, {
        name: error.name,
        message: error.message,
        code: error.code,
        codeName: error.codeName,
      });
      
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.log(`Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

async function connectToDatabase() {
  console.log('Starting database connection...');
  
  return withRetry(async () => {
    try {
      // Check if we're already connected
      try {
        await client.db().command({ ping: 1 });
        console.log('Already connected to MongoDB');
        return client.db();
      } catch {
        console.log('Connecting to MongoDB...');
        await client.connect();
        console.log('MongoDB connection established');
      }

      // Verify connection
      const db = client.db();
      await db.command({ ping: 1 });
      console.log('Database ping successful');
      
      return db;
    } catch (error: any) {
      console.error('Connection error:', {
        name: error.name,
        message: error.message,
        code: error.code,
        codeName: error.codeName,
        stack: error.stack,
      });
      
      // Close client on error
      try {
        await client.close();
        console.log('Connection closed after error');
      } catch (closeError) {
        console.error('Error closing connection:', closeError);
      }
      
      throw error;
    }
  });
}

export async function POST(request: Request) {
  console.log('Received waitlist signup request');
  
  try {
    const { email } = await request.json();
    console.log('Processing signup for email:', email);

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      console.log('Invalid email format:', email);
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    const collection = db.collection('signups');
    
    // Check for existing email
    const existingSignup = await collection.findOne({ email });
    if (existingSignup) {
      console.log('Email already registered:', email);
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Insert new signup
    const result = await collection.insertOne({
      email,
      createdAt: new Date(),
    });

    if (!result.acknowledged) {
      throw new Error('Failed to insert document');
    }

    console.log('Successfully inserted new signup:', result.insertedId);
    return NextResponse.json(
      { message: 'Successfully joined the waitlist!' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('API Error:', {
      name: error.name,
      message: error.message,
      code: error.code,
      codeName: error.codeName,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });

    // Map specific MongoDB errors to user-friendly messages
    if (error.name === 'MongoServerSelectionError') {
      return NextResponse.json(
        { error: 'Unable to connect to the database. Please try again later.' },
        { status: 503 }
      );
    }

    if (error.name === 'MongoNetworkError') {
      return NextResponse.json(
        { error: 'Network error occurred. Please check your connection and try again.' },
        { status: 503 }
      );
    }

    if (error.name === 'MongoError' && error.code === 11000) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  } finally {
    try {
      await client.close();
      console.log('MongoDB connection closed');
    } catch (error) {
      console.error('Error closing connection:', error);
    }
  }
} 