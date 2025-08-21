import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { getSession } from '@/lib/session'

/**
 * @swagger
 * /api/games/upload:
 *   post:
 *     summary: Upload game image
 *     description: Upload an image file for a game
 *     tags:
 *       - Games
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   description: URL to access the uploaded image
 *       400:
 *         description: Invalid file
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
export async function POST(request: Request) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({
        error: 'Not authenticated'
      }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    
    if (!file) {
      return NextResponse.json({
        error: 'No file uploaded'
      }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({
        error: 'Only image files are allowed'
      }, { status: 400 })
    }

    // Create unique filename
    const ext = file.name.split('.').pop()
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`
    
    // Ensure uploads directory exists
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    try {
      await mkdir(uploadDir, { recursive: true })
      await writeFile(join(uploadDir, filename), Buffer.from(await file.arrayBuffer()))
    } catch (error) {
      console.error('Failed to write file:', error)
      return NextResponse.json({
        error: 'Failed to save file'
      }, { status: 500 })
    }

    return NextResponse.json({
      url: `/uploads/${filename}`
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({
      error: 'Failed to process upload'
    }, { status: 500 })
  }
}