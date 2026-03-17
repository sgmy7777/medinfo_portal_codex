import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const newPassword = '290887GtNz1987'
  const hashed = await bcrypt.hash(newPassword, 12)

  const updated = await prisma.adminUser.update({
    where: { email: 'admin@yourdomain.ru' },
    data: { password: hashed },
  })

  console.log('✅ Пароль изменён для:', updated.email)
  console.log('   Новый пароль:', newPassword)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
