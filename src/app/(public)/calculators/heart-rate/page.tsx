import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Калькулятор пульсовых зон — ЗдравИнфо',
  description: 'Рассчитайте 5 пульсовых зон для тренировок: жиросжигание, кардио и максимальная нагрузка.',
  openGraph: {
    title: 'Калькулятор пульсовых зон — ЗдравИнфо',
    description: 'Рассчитайте 5 пульсовых зон для тренировок: жиросжигание, кардио и максимальная нагрузка.',
    type: 'website',
  },
}
import HeartRateCalculatorClient from './client'

export default function HeartRateCalculator(props: any) {
  return <HeartRateCalculatorClient {...props} />
}
