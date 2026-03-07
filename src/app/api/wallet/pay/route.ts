import { NextRequest, NextResponse } from 'next/server'
import { dbConnect } from '@/lib/dbConnect'
import Wallet from '@/app/models/wallet'

export async function POST(req: NextRequest) {
  await dbConnect()

  try {
    const body = await req.json()

    const { userId, amount, purpose, refId } = body

    if (!userId || !amount) {
      return NextResponse.json(
        { message: 'Missing payment data' },
        { status: 400 }
      )
    }

    const wallet = await Wallet.findOne({ userId })

    if (!wallet) {
      return NextResponse.json(
        { message: 'Wallet not found' },
        { status: 404 }
      )
    }

    if (wallet.balance < amount) {
      return NextResponse.json(
        { message: 'Insufficient wallet balance' },
        { status: 400 }
      )
    }

    // Deduct balance
    wallet.balance -= amount

    wallet.transactions.push({
      type: 'debit',
      amount,
      purpose,
      refId,
      createdAt: new Date()
    })

    await wallet.save()

    return NextResponse.json({
      success: true,
      balance: wallet.balance
    })
  } catch (err) {
    console.error(err)

    return NextResponse.json(
      { message: 'Wallet payment failed' },
      { status: 500 }
    )
  }
}