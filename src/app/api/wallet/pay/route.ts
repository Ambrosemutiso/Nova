import { NextRequest, NextResponse } from 'next/server'
import { dbConnect } from '@/lib/dbConnect'
import Wallet from '@/app/models/wallet'
import WalletTransaction from '@/app/models/walletTransaction'
import PaymentIntent from '@/app/models/paymentIntent'
import Order from '@/app/models/orders'
import Installment from '@/app/models/InstallmentOrder'

export async function POST(req: NextRequest) {
  await dbConnect()

  try {
    const body = await req.json()

    const {
      userId,
      amount,
      purpose,
      refId,
      items,
      deliveryFee,
      county,
      town
    } = body

    const wallet = await Wallet.findOne({ userId })

    if (!wallet) {
      return NextResponse.json({ message: 'Wallet not found' }, { status: 404 })
    }

    if (wallet.balance < amount) {
      return NextResponse.json(
        { message: 'Insufficient wallet balance' },
        { status: 400 }
      )
    }

    let normalizedRefId = refId

    /* ================================
       🛒 ORDER
    ================================= */

    if (purpose === 'order') {

      const order = await Order.create({
        userId,
        items,
        deliveryFee,
        totalAmount: amount,
        customerInfo: { county, town },
        status: 'paid',
      })

      normalizedRefId = order._id
    }

    /* ================================
       📆 INSTALLMENT MONTHLY
    ================================= */

    if (purpose === 'installment-monthly') {

      const inst = await Installment.findById(refId)

      if (inst) {

        const paidAmount =
          Number(inst.paidAmount ?? 0) + Number(amount)

        const isCompleted = paidAmount >= inst.totalAmount

        await Installment.findByIdAndUpdate(
          refId,
          {
            $set: {
              paidAmount,
              status: isCompleted ? 'completed' : inst.status
            }
          }
        )
      }
    }

    /* ================================
       💰 WALLET DEDUCTION
    ================================= */

    wallet.balance -= amount
    await wallet.save()

    /* ================================
       💳 WALLET TRANSACTION
    ================================= */

    await WalletTransaction.create({
      walletId: wallet._id,
      userId: wallet.userId,
      type: 'debit',
      purpose,
      status: 'paid',
      amount,
      label: 'Wallet payment',
      reference: `NPAY-${Date.now()}`,
      balanceAfter: wallet.balance
    })

    /* ================================
       💳 PAYMENT INTENT (LOGGING)
    ================================= */

    await PaymentIntent.create({
      userId,
      amount,
      method: 'npay',
      purpose,
      refId: normalizedRefId,
      status: 'paid'
    })

    return NextResponse.json({
      success: true
    })

  } catch (err) {

    console.error(err)

    return NextResponse.json(
      { message: 'Wallet payment failed' },
      { status: 500 }
    )
  }
}