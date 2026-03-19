import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Калькулятор нормы калорий в день — ЗдравИнфо',
  description: 'Рассчитайте суточную потребность в калориях по формуле Миффлина–Сан-Жеора с учётом возраста и активности.',
  openGraph: {
    title: 'Калькулятор нормы калорий в день — ЗдравИнфо',
    description: 'Рассчитайте суточную потребность в калориях по формуле Миффлина–Сан-Жеора с учётом возраста и активности.',
    type: 'website',
  },
}
import CaloriesCalculatorClient from './client'

export default function CaloriesCalculator(props: any) {
  return <CaloriesCalculatorClient {...props} />
}
