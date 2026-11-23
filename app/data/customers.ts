import type { Customer } from '~/types'

// Демо-клиенты. Имена и почты вымышленные.
const PEOPLE: [string, string, string][] = [
  ['Анна Петросян', 'anna.p', 'Ереван'],
  ['Давид Саркисян', 'david.s', 'Ереван'],
  ['Мария Ованнисян', 'maria.o', 'Гюмри'],
  ['Арам Григорян', 'aram.g', 'Ереван'],
  ['Елена Смирнова', 'elena.s', 'Москва'],
  ['Карен Мартиросян', 'karen.m', 'Ванадзор'],
  ['Лилит Акопян', 'lilit.a', 'Ереван'],
  ['Сергей Иванов', 'sergey.i', 'Санкт-Петербург'],
  ['Нарек Арутюнян', 'narek.a', 'Абовян'],
  ['Ольга Кузнецова', 'olga.k', 'Москва'],
  ['Тигран Восканян', 'tigran.v', 'Ереван'],
  ['Ани Манукян', 'ani.m', 'Эчмиадзин'],
  ['Михаил Орлов', 'mikhail.o', 'Казань'],
  ['Гаяне Хачатрян', 'gayane.kh', 'Ереван'],
  ['Армен Бабаян', 'armen.b', 'Гюмри'],
  ['Наталья Волкова', 'natalia.v', 'Новосибирск'],
  ['Самвел Минасян', 'samvel.m', 'Ереван'],
  ['Сона Галстян', 'sona.g', 'Дилижан'],
]

export function createDemoCustomers(today: Date): Customer[] {
  return PEOPLE.map(([name, login, city], i) => {
    const registered = new Date(today)
    registered.setDate(registered.getDate() - (400 - i * 19))
    return {
      id: i + 1,
      name,
      email: `${login}@example.com`,
      phone: `+374 ${String(91 + (i % 8)).padStart(2, '0')} ${String(100000 + i * 37211).slice(0, 6)}`,
      city,
      registeredAt: registered.toISOString().slice(0, 10),
    }
  })
}
