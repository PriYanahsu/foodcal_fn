import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Mock authentication - in production, verify against database
    // For demo: accept any email/password combination
    const mockUser = {
      id: Math.random().toString(36).substr(2, 9),
      name: email.split('@')[0],
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
      { success: false, error: 'Failed to process login request' },
      { status: 500 }
    );
  }
}
