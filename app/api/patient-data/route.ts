import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';

export async function POST(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    const data = await request.json();
    
    if (!data.scannerManufacturer || !data.scannerModel || !data.month) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newData = {
      ...data,
      createdAt: new Date()
    };
    
    const result = await db.collection('patient_data').insertOne(newData);
    
    return NextResponse.json({
      _id: result.insertedId,
      ...newData
    });
  } catch (error) {
    console.error('Error saving data:', error);
    return NextResponse.json(
      { error: 'Failed to save data' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    const data = await db.collection('patient_data')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
} 