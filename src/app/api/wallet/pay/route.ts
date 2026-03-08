import { NextRequest, NextResponse } from 'next/server'
import { dbConnect } from '@/lib/dbConnect'
import Wallet from '@/app/models/wallet'
import WalletTransaction from '@/app/models/walletTransaction'

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

    await wallet.save()

    // Create wallet transaction
    await WalletTransaction.create({
      walletId: wallet._id,
      userId: wallet.userId,

      type: 'debit',
      purpose: purpose || 'order',

      status: 'paid',

      amount,
      balanceAfter: wallet.balance,

      label: 'Wallet payment',

      reference: refId || undefined
    })

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