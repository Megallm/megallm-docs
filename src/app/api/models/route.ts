import { NextResponse } from 'next/server';

const API_KEY = 'sk-mega-25f8b5b41a531921b24bf59daa8ccc0d38da68364662fb8956d972333b8d86b9';
const MEGALLM_API_ENDPOINT = 'https://ai.megallm.io/v1/models';

export async function GET() {
  try {
    const response = await fetch(MEGALLM_API_ENDPOINT, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.statusText}`);
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      data: data.data || [],
      total: data.data?.length || 0,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching models:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred',
        data: [],
        total: 0
      },
      { status: 500 }
    );
  }
}