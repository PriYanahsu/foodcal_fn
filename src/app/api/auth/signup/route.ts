import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Mock signup - in production, create user in database
    const mockUser = {
      id: Math.random().toString(36).substr(2, 9),
      name: name,
      email: email,
    };

    const mockToken = `mock_token_${Date.now()}`;

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return NextResponse.json({
      success: true,
      user: mockUser,
      token: mockToken,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to process signup request' },
      { status: 500 }
    );
  }
}
