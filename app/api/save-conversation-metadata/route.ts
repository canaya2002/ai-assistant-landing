import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Mock exitoso - tu chat funcionará
    return NextResponse.json({ 
      success: true,
      message: 'Metadata saved successfully' 
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    error: 'Method not allowed' 
  }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ 
    error: 'Method not allowed' 
  }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ 
    error: 'Method not allowed' 
  }, { status: 405 });
}