import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'


export async function POST(request: NextRequest) {
  try {
    const { credits, userId } = await request.json()

    if (!credits || !userId) {
      return NextResponse.json(
        { error: 'Missing credits or userId' },
        { status: 400 }
      )
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    if (!stripeSecretKey) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-02-24.acacia',
    })

    const creditPackages = {
      10: { price: 1000, name: '10 Credits' },
      25: { price: 2500, name: '25 Credits' },
      50: { price: 5000, name: '50 Credits' },
      100: { price: 10000, name: '100 Credits' },
    }

    const packageInfo = creditPackages[credits as keyof typeof creditPackages]
    if (!packageInfo) {
      return NextResponse.json(
        { error: 'Invalid credit package' },
        { status: 400 }
      )
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `VietLinker ${packageInfo.name}`,
              description: `Mua ${credits} credits cho tài khoản VietLinker`,
            },
            unit_amount: packageInfo.price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/credits?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/credits?canceled=true`,
      metadata: {
        userId,
        credits: credits.toString(),
      },
    })

    return NextResponse.json({ sessionId: session.id })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
