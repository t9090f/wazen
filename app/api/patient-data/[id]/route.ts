import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '../../../../lib/mongodb';

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    const result = await db.collection('patient_data').deleteOne({ _id: new ObjectId(params.id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Data not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting data:', error);
    return NextResponse.json({ error: 'Failed to delete data' }, { status: 500 });
  }
}

type RouteContext = {
  params: {
    id: string;
  };
};

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    console.log('Received update request for ID:', context.params.id);
    
    if (!context.params.id) {
      console.error('No ID provided');
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const body = await request.json();
    
    console.log('Request body:', body);

    if (!ObjectId.isValid(context.params.id)) {
      console.error('Invalid MongoDB ID format:', context.params.id);
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    // إزالة _id و createdAt من البيانات المراد تحديثها
    const { _id, createdAt, ...updateData } = body;

    console.log('Raw update data:', updateData);

    // تحويل القيم الرقمية
    const processedData = Object.entries(updateData).reduce((acc, [key, value]) => {
      if (value === '') {
        acc[key] = null;
      } else if (typeof value === 'string' && !isNaN(Number(value))) {
        acc[key] = Number(value);
      } else {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);

    console.log('Processed update data:', processedData);

    // التحقق من وجود المستند أولاً
    const existingDoc = await db.collection('patient_data').findOne({ _id: new ObjectId(context.params.id) });
    if (!existingDoc) {
      console.error('Document not found for ID:', context.params.id);
      return NextResponse.json({ error: 'Data not found' }, { status: 404 });
    }

    console.log('Existing document:', existingDoc);

    try {
      // تحديث المستند
      await db.collection('patient_data').updateOne(
        { _id: new ObjectId(context.params.id) },
        { $set: processedData }
      );

      // جلب المستند المحدث
      const updatedDoc = await db.collection('patient_data').findOne({ _id: new ObjectId(context.params.id) });
      
      if (!updatedDoc) {
        console.error('Failed to retrieve updated document');
        return NextResponse.json({ error: 'Failed to update data' }, { status: 500 });
      }

      console.log('Update successful:', updatedDoc);
      return NextResponse.json(updatedDoc);
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { 
          error: 'Database error', 
          details: dbError instanceof Error ? dbError.message : 'Unknown database error'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Detailed error in PUT request:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update data', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 