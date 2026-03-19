import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Калькулятор ИМТ (индекс массы тела) — ЗдравИнфо',
  description: 'Рассчитайте индекс массы тела онлайн по формуле ВОЗ. Узнайте норму ИМТ для вашего роста и веса.',
  openGraph: {
    title: 'Калькулятор ИМТ (индекс массы тела) — ЗдравИнфо',
    description: 'Рассчитайте индекс массы тела онлайн по формуле ВОЗ. Узнайте норму ИМТ для вашего роста и веса.',
    type: 'website',
  },
}
import BMICalculatorClient from './client'

export default function BMICalculator(props: any) {
  return <BMICalculatorClient {...props} />
}
