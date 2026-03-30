export async function POST(req) {
  try {
    // Logout is handled on client side by removing token
    // This endpoint can be used for server-side logout if needed (e.g., token blacklist)

    return Response.json(
      {
        success: true,
        message: 'Logout successful',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return Response.json(
      { success: false, message: 'Logout failed' },
      { status: 500 }
    );
  }
}
