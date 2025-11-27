import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { Bars3Icon, BellIcon, XMarkIcon, ShoppingCartIcon } from '@heroicons/react/24/outline'
import { usePathname, useRouter } from "next/navigation";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useBasket } from '../contexts/BasketContext';
import { useAdminAuth } from '../contexts/AdminAuthContext';



function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Navbar() {
  const [user, setUser] = useState(null);
  const { getBasketItemsCount } = useBasket();
  const { isAuthenticated: isAdmin, isLoading: adminLoading } = useAdminAuth();

  const router = useRouter();
  const pathname = usePathname();
  
  // Create navigation array with conditional Admin link
  const navigation = [
    { name: 'Prodotti', href: '/products', current: pathname === "/products" },
    //{ name: 'Categorie', href: '/categories', current: pathname === "/categories" },
  ];
  
  // Add Admin link only if user is authenticated as admin and not loading
  if (isAdmin && !adminLoading) {
    navigation.push({ name: 'Admin', href: '/admin/products', current: pathname.startsWith("/admin") });
  }

  const basketItemsCount = getBasketItemsCount();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe(); // Cleanup listener
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/"); // Reindirizza alla home page
  };

  return (
    <Disclosure
      as="nav"
      className="relative bg-[color:#aa8510] md:mx-auto md:w-4/5 md:my-2 md:rounded-full dark:bg-gray-800/50 dark:after:pointer-events-none dark:after:absolute dark:after:inset-x-0 dark:after:bottom-0 dark:after:h-px dark:after:bg-white/10"
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
                {!adminLoading && navigation.map((item) => (
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

            {/* Profile dropdown */}
            <Menu as="div" className="relative ml-3">
              <MenuButton className="relative flex rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">
                <span className="absolute -inset-1.5" />
                <span className="sr-only">Open user menu</span>
                <img
                  alt=""
                  src={user && user.photoURL ? user.photoURL : "https://www.gravatar.com/avatar/?d=mp"}
                  className="size-8 rounded-full bg-gray-800 outline -outline-offset-1 outline-white/10"
                />
              </MenuButton>

              <MenuItems
                transition
                className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg outline outline-black/5 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in dark:bg-gray-800 dark:shadow-none dark:-outline-offset-1 dark:outline-white/10"
              >
                {user ? (
                  // Menu for logged-in users
                  <>
                    <MenuItem>
                      <div className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                        Ciao, {user.displayName || user.email}
                      </div>
                    </MenuItem>
                    <MenuItem>
                      <Link
                        href="/orders"
                        className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:outline-hidden dark:text-gray-300 dark:data-focus:bg-white/5"
                      >
                        I miei ordini
                      </Link>
                    </MenuItem>
                    <MenuItem>
                      <a
                        onClick={handleLogout}
                        className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:outline-hidden dark:text-gray-300 dark:data-focus:bg-white/5 cursor-pointer"
                      >
                        Esci
                      </a>
                    </MenuItem>
                  </>
                ) : (
                  // Menu for non-logged-in users
                  <>
                    <MenuItem>
                      <Link
                        href="/login"
                        className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:outline-hidden dark:text-gray-300 dark:data-focus:bg-white/5"
                      >
                        Accedi
                      </Link>
                    </MenuItem>
                    <MenuItem>
                      <Link
                        href="/register"
                        className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:outline-hidden dark:text-gray-300 dark:data-focus:bg-white/5"
                      >
                        Registrati
                      </Link>
                    </MenuItem>
                  </>
                )}
              </MenuItems>
            </Menu>
          </div>
        </div>
      </div>

      <DisclosurePanel className="sm:hidden">
        <div className="space-y-1 px-2 pt-2 pb-3">
          {!adminLoading && navigation.map((item) => (
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
