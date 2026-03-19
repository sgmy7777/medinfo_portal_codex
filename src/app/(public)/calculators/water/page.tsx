import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Калькулятор нормы воды в день — ЗдравИнфо',
  description: 'Сколько воды нужно пить в день? Рассчитайте норму с учётом веса, физической активности и климата.',
  openGraph: {
    title: 'Калькулятор нормы воды в день — ЗдравИнфо',
    description: 'Сколько воды нужно пить в день? Рассчитайте норму с учётом веса, физической активности и климата.',
    type: 'website',
  },
}
import WaterCalculatorClient from './client'

export default function WaterCalculator(props: any) {
  return <WaterCalculatorClient {...props} />
}
