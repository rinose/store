import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'
import { Bars3Icon, XMarkIcon, ShoppingCartIcon } from '@heroicons/react/24/outline'
import { usePathname, useRouter } from "next/navigation";
import Link from 'next/link';
import { useBasket } from '../contexts/BasketContext';



function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Navbar() {
  const { getBasketItemsCount } = useBasket();

  const router = useRouter();
  const pathname = usePathname();
  
  // Create navigation array
  const navigation = [
    { name: 'Prodotti', href: '/products', current: pathname === "/products" },
    //{ name: 'Categorie', href: '/categories', current: pathname === "/categories" },
  ];

  const basketItemsCount = getBasketItemsCount();

  return (
    <Disclosure
      as="nav"
      className="fixed top-0 left-0 right-0 z-50 bg-[color:#aa8510] md:mx-auto md:w-4/5 md:my-2 md:rounded-full dark:bg-gray-800/50 dark:after:pointer-events-none dark:after:absolute dark:after:inset-x-0 dark:after:bottom-0 dark:after:h-px dark:after:bg-white/10"
    >
      <div className="mx-auto max-w-7xl md:px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            {/* Mobile menu button*/}
            <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md p-2 text-white hover:bg-white/5 hover:text-gray-800 focus:outline-2 focus:-outline-offset-1 focus:outline-indigo-500">
              <span className="absolute -inset-0.5" />
              <span className="sr-only">Open main menu</span>
              <Bars3Icon aria-hidden="true" className="block size-6 group-data-open:hidden" />
              <XMarkIcon aria-hidden="true" className="hidden size-6 group-data-open:block" />
            </DisclosureButton>
          </div>
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex shrink-0 items-center">
              <Link href="/"><img
                alt="Cristofaro Chef Logo"
                src="/images/logo_black_white.jpg"
                className="h-10 w-auto"
              /></Link>
            </div>
            <div className="hidden sm:ml-6 sm:block">
              <div className="flex space-x-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    aria-current={item.current ? 'page' : undefined}
                    className={classNames(
                      item.current
                        ? 'bg-gray-900 text-white dark:bg-gray-950/50'
                        : 'text-white hover:bg-white/5 hover:text-gray-800',
                      'rounded-md px-3 py-2 text-sm font-medium',
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            {/* Shopping Cart Icon */}
            <button
              type="button"
              onClick={() => router.push('/basket')}
              className="relative rounded-full p-1 text-white focus:outline-2 focus:outline-offset-2 focus:outline-indigo-500 dark:hover:text-white mr-3"
            >
              <span className="absolute -inset-1.5" />
              <span className="sr-only">View shopping cart</span>
              <ShoppingCartIcon aria-hidden="true" className="size-6" />
              {basketItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {basketItemsCount > 99 ? '99+' : basketItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <DisclosurePanel className="sm:hidden">
        <div className="space-y-1 px-2 pt-2 pb-3">
          {navigation.map((item) => (
            <DisclosureButton
              key={item.name}
              as={Link}
              href={item.href}
              aria-current={item.current ? 'page' : undefined}
              className={classNames(
                item.current
                  ? 'bg-gray-900 text-white dark:bg-gray-950/50'
                  : 'text-gray-300 hover:bg-white/5 hover:text-white',
                'block rounded-md px-3 py-2 text-base font-medium',
              )}
            >
              {item.name}
            </DisclosureButton>
          ))}
        </div>
      </DisclosurePanel>
    </Disclosure>
  )
}
