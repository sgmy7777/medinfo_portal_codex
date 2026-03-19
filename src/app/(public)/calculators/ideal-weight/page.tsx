import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Калькулятор идеального веса — ЗдравИнфо',
  description: 'Рассчитайте идеальный вес по 5 медицинским формулам: Броки, Дивайна, Робинсона, Миллера и Лоренца.',
  openGraph: {
    title: 'Калькулятор идеального веса — ЗдравИнфо',
    description: 'Рассчитайте идеальный вес по 5 медицинским формулам: Броки, Дивайна, Робинсона, Миллера и Лоренца.',
    type: 'website',
  },
}
import IdealWeightCalculatorClient from './client'

export default function IdealWeightCalculator(props: any) {
  return <IdealWeightCalculatorClient {...props} />
}
